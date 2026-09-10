# label_processor.py
from __future__ import annotations

import json
import logging
import pathlib
from dataclasses import dataclass
from typing import Callable, List, Tuple, Any

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# --------------------------------------------------------------------------- #
# Optional: if you want a default import that works out‑of‑the‑box
# --------------------------------------------------------------------------- #
try:
    from motionstack.reader import MotionReader  # type: ignore
except Exception:  # pragma: no cover
    MotionReader = None  # noqa: N801  (kept for typing purposes only)


# --------------------------------------------------------------------------- #
# Helper – simple wrapper around StandardScaler (kept public for re‑use)
# --------------------------------------------------------------------------- #
def scale_data(X: np.ndarray) -> Tuple[np.ndarray, StandardScaler]:
    """
    Scale ``X`` column‑wise to zero‑mean / unit‑variance.

    Parameters
    ----------
    X:
        2‑D array with shape ``(n_samples, n_features)``.

    Returns
    -------
    X_scaled, scaler
        The scaled matrix and the fitted ``StandardScaler`` instance.
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, scaler


# --------------------------------------------------------------------------- #
# Core processor class
# --------------------------------------------------------------------------- #
@dataclass
class LabelProcessor:
    """
    High‑level helper that turns a JSON label file + its corresponding BVH
    motion file into a tidy ``pandas.DataFrame`` and finally into
    ``(X, y, scaler)`` ready for ML pipelines.

    Typical usage
    -------------
    >>> from label_processor import LabelProcessor
    >>> proc = LabelProcessor(
    ...     label_root="/home/aiwlab/hack/motion_viz/data/labels",
    ...     bvh_root="/data/bvh",
    ...     cache_root="/home/aiwlab/hack/motion_viz/data/labels",
    ... )
    >>> X, y, scaler = proc.process("my_label_file.json")
    """

    # ------------------------------------------------------------------- #
    # Public configuration attributes (all are pathlib.Path objects)
    # ------------------------------------------------------------------- #
    label_root: pathlib.Path                # folder that contains *.json label files
    bvh_root: pathlib.Path                  # folder that contains *.bvh motion files
    cache_root: pathlib.Path               # where *.pkl cache files will be stored
    motion_reader_cls: Callable[[pathlib.Path, str], Any] = MotionReader  # default reader
    motion_suffix: str = "bvh_100"          # suffix that MotionReader expects

    # ------------------------------------------------------------------- #
    # Internals – created once per instance
    # ------------------------------------------------------------------- #
    _logger: logging.Logger = logging.getLogger("LabelProcessor")

    # ------------------------------------------------------------------- #
    # Construction helpers
    # ------------------------------------------------------------------- #
    def __post_init__(self) -> None:
        """Normalise all path‑like arguments to ``Path`` objects."""
        self.label_root = pathlib.Path(self.label_root)
        self.bvh_root = pathlib.Path(self.bvh_root)
        self.cache_root = pathlib.Path(self.cache_root)

        if not self.label_root.is_dir():
            raise FileNotFoundError(
                f"The label root directory does not exist: {self.label_root}"
            )
        if not self.bvh_root.is_dir():
            raise FileNotFoundError(
                f"The BVH root directory does not exist: {self.bvh_root}"
            )

        if self.motion_reader_cls is None:
            raise RuntimeError(
                "MotionReader could not be imported. "
                "Pass a custom ``motion_reader_cls`` when constructing "
                "LabelProcessor if you are running in an environment without "
                "the `motionstack` package."
            )

    # ------------------------------------------------------------------- #
    # Low‑level helpers – they are *private* because external users should
    # go through the high‑level ``process`` method.
    # ------------------------------------------------------------------- #
    def _load_label_json(self, json_path: pathlib.Path) -> dict:
        """Read a JSON label file and return the parsed dictionary."""
        self._logger.debug("Loading label JSON from %s", json_path)
        try:
            with json_path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Label file not found: {json_path}") from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in file {json_path}") from exc

    def _get_motion_path_from_label(self, label_path: pathlib.Path) -> pathlib.Path:
        """
        Derive the expected BVH file name from a label file name.

        The original code used a relative path that walked four directories
        up – we keep the same behaviour but make it explicit.
        """
        stem = label_path.stem
        candidate = self.bvh_root / f"{stem}.bvh"
        if not candidate.is_file():
            raise FileNotFoundError(
                f"Corresponding motion file not found for label {label_path!s}. "
                f"Expected BVH at {candidate!s}"
            )
        return candidate

    def _get_label_path_from_motion(self, motion_path: pathlib.Path) -> pathlib.Path:
        """
        Reverse of ``_get_motion_path_from_label`` – useful when you only have
        the BVH file and want to locate the JSON file.

        Currently returns ``<label_root>/<stem>.json``.
        """
        stem = motion_path.stem
        candidate = self.label_root / f"{stem}.json"
        if not candidate.is_file():
            raise FileNotFoundError(
                f"Corresponding label file not found for motion {motion_path!s}. "
                f"Expected JSON at {candidate!s}"
            )
        return candidate

    def _read_motion(self, bvh_path: pathlib.Path) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load a BVH file via ``MotionReader`` and return two numpy arrays:

        * rotations – shape ``(n_frames, n_joints, 4)`` (quaternion)
        * positions – shape ``(n_frames, n_joints, 3)`` (XYZ)
        """
        self._logger.debug("Reading motion data from %s", bvh_path)
        mr = self.motion_reader_cls(bvh_path, self.motion_suffix)

        # The original script assumed that ``motion.get_rotations`` and
        # ``motion.get_positions`` already return list‑like structures.
        rotations = np.array(mr.motion.get_rotations())
        positions = np.array(mr.motion.get_positions())
        return rotations, positions

    def _create_dataframe(
        self,
        json_path: pathlib.Path,
        rotations: np.ndarray,
        positions: np.ndarray,
    ) -> pd.DataFrame:
        """
        Build the tidy ``DataFrame`` required by downstream code.

        Columns:
          - FILEPATH   – original JSON file (string)
          - FRAME_INDEX – integer frame number
          - ORIENTATION – quaternion (numpy array, kept as an object)
          - POSITION    – XYZ array (object)
          - LABEL       – list of element_id's (int)
          - ERGO_METHOD – raw method string from the label file
        """
        label_dict = self._load_label_json(json_path)

        # Pre‑allocate a list of rows – far faster than ``df.loc[len(df)]`` in a loop.
        rows: List[dict] = []

        for label in label_dict.get("labels", []):
            start = int(label["start_frame"])
            end = int(label["end_frame"])
            # Grab the list of element IDs once – the original code kept it as a list.
            element_ids = [cat["element_id"] for cat in label["categories"]]

            for frame_nr in range(start, end):
                rows.append(
                    {
                        "FILEPATH": str(json_path),
                        "FRAME_INDEX": frame_nr,
                        "ORIENTATION": rotations[frame_nr],
                        "POSITION": positions[frame_nr],
                        "LABEL": element_ids,
                        "ERGO_METHOD": label["ergo_method"],
                    }
                )

        df = pd.DataFrame(
            rows,
            columns=[
                "FILEPATH",
                "FRAME_INDEX",
                "ORIENTATION",
                "POSITION",
                "LABEL",
                "ERGO_METHOD",
            ],
        )
        self._logger.info(
            "Created DataFrame with %d rows from %s", len(df), json_path.name
        )
        return df

    def _prepare_X_y(
        self, df: pd.DataFrame
    ) -> Tuple[np.ndarray, np.ndarray, StandardScaler]:
        """
        Convert the DataFrame columns ``ORIENTATION`` and ``LABEL`` into ``X``
        and ``y`` suitable for scikit‑learn.

        Returns
        -------
        X_scaled, y, scaler
            ``X_scaled`` – scaled orientation matrix (float64)
            ``y``       – integer label matrix (shape ``(n_samples, n_labels)``)
            ``scaler``  – fitted ``StandardScaler`` so that you can inverse‑transform later.
        """
        # ``ORIENTATION`` holds a quaternion per row – we need to flatten it.
        X_raw = np.stack(df["ORIENTATION"].tolist()).astype(np.float64)
        X_scaled, scaler = scale_data(X_raw)

        # ``LABEL`` is a *list* per row; we convert to a 2‑D integer array.
        y_raw = np.stack(df["LABEL"].tolist()).astype(np.int64)
        return X_scaled, y_raw, scaler

    # ------------------------------------------------------------------- #
    # Public API
    # ------------------------------------------------------------------- #
    def process(self, label_file: str | pathlib.Path) -> Tuple[np.ndarray, np.ndarray, StandardScaler]:
        """
        End‑to‑end processing of a JSON label file.

        1. Look for a cached ``*.pkl`` version in ``cache_root``.
        2. If it does **not** exist:
           * read the matching BVH file,
           * build the DataFrame,
           * store the DataFrame as ``*.pkl`` for future runs.
        3. Return the scaled feature matrix ``X``, the integer label matrix ``y``,
           and the fitted ``StandardScaler`` instance.

        Parameters
        ----------
        label_file:
            Path (relative to ``label_root`` or absolute) of the JSON label file.

        Returns
        -------
        X_scaled, y, scaler
        """
        label_path = pathlib.Path(label_file)
        if not label_path.is_absolute():
            label_path = self.label_root / label_path

        cache_path = self.cache_root / f"{label_path.stem}.pkl"

        # ------------------------------------------------------------------- #
        # Load from cache if available
        # ------------------------------------------------------------------- #
        if cache_path.is_file():
            self._logger.info("Loading cached DataFrame from %s", cache_path)
            df = pd.read_pickle(cache_path)
        else:
            # ------------------------------------------------------------------- #
            # No cache → full pipeline
            # ------------------------------------------------------------------- #
            self._logger.info(
                "Cache miss for %s – building DataFrame from scratch.", label_path.name
            )
            bvh_path = self._get_motion_path_from_label(label_path)
            rotations, positions = self._read_motion(bvh_path)
            df = self._create_dataframe(label_path, rotations, positions)

            self._logger.debug("Saving cache to %s", cache_path)
            df.to_pickle(cache_path)

        # ------------------------------------------------------------------- #
        # Convert to ML‑ready matrices
        # ------------------------------------------------------------------- #
        X, y, scaler = self._prepare_X_y(df)
        return X, y, scaler