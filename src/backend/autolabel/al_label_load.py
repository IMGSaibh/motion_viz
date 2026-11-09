# label_processor.py
from __future__ import annotations

import json
import logging
import pathlib
from dataclasses import dataclass
from typing import Callable, List, Tuple, Any

from backend.autolabel import al_utils

import numpy as np
import pandas as pd


# --------------------------------------------------------------------------- #
# Core processor class
# --------------------------------------------------------------------------- #
@dataclass
class LabelLoader:

    label_root: pathlib.Path                # folder that contains *.json label files
    motion_root: pathlib.Path                  # folder that contains motion files
    cache_root: pathlib.Path               # where *.pkl cache files will be stored

    _logger: logging.Logger = logging.getLogger("LabelLoader")

    def __post_init__(self) -> None:
        """Normalise all path-like arguments to ``Path`` objects."""
        self.label_root = pathlib.Path(self.label_root)
        self.motion_root = pathlib.Path(self.motion_root)
        self.cache_root = pathlib.Path(self.cache_root)

        if not self.label_root.is_dir():
            raise FileNotFoundError(
                f"The label root directory does not exist: {self.label_root}"
            )
        if not self.motion_root.is_dir():
            raise FileNotFoundError(
                f"The BVH root directory does not exist: {self.motion_root}"
            )

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


    def _get_label_path_from_motion(self, motion_path: pathlib.Path) -> pathlib.Path:
        """
        Reverse of ``_get_motion_path_from_label`` – useful when you only have
        the motion file and want to locate the label-JSON file.

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

    def _read_motion(self, motion_path: pathlib.Path) -> Tuple[np.ndarray, np.ndarray]:
        """
        Loads a motionstack-converted npy-file with shape:
        * ``(n_frames, n_joints, 7)``,
        * where 
        * [0-2] are positions (x,y,z)
        * and
        * [3-6] quaternions in w,x,y,z
        """
        self._logger.debug("Reading motion data from %s", motion_path)
        try:
            motiondata = np.load(motion_path)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Motion file not found: {motion_path}") from exc
        except (OSError, ValueError) as exc:
            raise ValueError(f"Could not read motion file: {motion_path}") from exc
   
        positions = motiondata[:,:,[0,1,2]]
        rotations = motiondata[:,:,[3,4,5,6]]
        
        return rotations, positions

    def _create_dataframe(
        self,
        json_path: pathlib.Path,
        rotations: np.ndarray,
        positions: np.ndarray,
    ) -> pd.DataFrame:
       
        label_dict = self._load_label_json(json_path)

        rows: List[dict] = []

        for label in label_dict.get("labels", []):
            start = int(label["start_frame"])
            end = int(label["end_frame"])
            # Grab the list of element IDs once – the original code kept it as a list.
            feature_ids = [cat["feature_id"] for cat in label["categories"]]

            for frame_nr in range(start, end+1):
                rows.append(
                    {
                        "FILEPATH": str(json_path),
                        "FRAME_INDEX": frame_nr,
                        "ORIENTATION": rotations[frame_nr],
                        "POSITION": positions[frame_nr],
                        "LABEL": feature_ids,
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

    def _prepare_X_y(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:

        # ``ORIENTATION`` holds a quaternion per row - we need to flatten it.
        X_raw = np.stack(df["ORIENTATION"].tolist()).astype(np.float64)

        # flatten
        X_raw = X_raw.reshape(X_raw.shape[0],X_raw.shape[1]*X_raw.shape[2])
        
        # One Hot encoded Labels. 8, since this the maximum per category label in RULA
        df = al_utils.one_hot_encode_labels(df, 8)
        y_raw = np.stack(df["ONEHOT"].tolist()).astype(np.int64)

        # quaternions do not need scaling
        return X_raw, y_raw

    def _load_dataframe(self, label_path: pathlib.Path) -> pd.DataFrame:
        print(f"[LOADER] creating DataFrame for {label_path}")
        cache_path = self.cache_root / f"{label_path.stem}.json.pkl"

        if cache_path.is_file():
            print(f"[LOADER] found cached Dataframe from {cache_path}")
            self._logger.info("Loading cached DataFrame from %s", cache_path)
            return pd.read_pickle(cache_path)

        print(f"[LOADER] no cache for {label_path.name}")
        self._logger.info(
            "Cache miss for %s - building DataFrame from scratch.", label_path.name
        )
        motion_file = self.motion_root / f"{label_path.stem}.npy"

        try:
            rotations, positions = self._read_motion(motion_file)

        except FileNotFoundError as exc:
            print(f"[LOADER] Motion file {motion_file} not found")
            return None
        
       
        df = self._create_dataframe(label_path, rotations, positions)

        self._logger.debug("Saving cache to %s", cache_path)
        df.to_pickle(cache_path)
        return df

    def load(self, label_files: list[str | pathlib.Path]) -> Tuple[np.ndarray, np.ndarray, StandardScaler]:

        ret = []
        for label_file in label_files:
            
            print(f"[LOADER] processing {label_file}")
            
            label_path = pathlib.Path(label_file)
            if not label_path.is_absolute():
                label_path = self.label_root / label_path

            if label_path.is_dir():
                label_files = [f for f in label_path.iterdir() if f.is_file()]
            else:
                label_files = [label_path] if label_path.is_file() else []

            for label_file in label_files:
                if pathlib.Path(label_file).suffix == ".json":
                    print(f"[LOADER] loading {label_file}")
                    file_to_read = label_file
                    
                elif pathlib.Path(label_file).suffix == ".npy":
                    # Read corresponding label file from label_root
                    print(f"[LOADER] reading json file of {label_file} from {pathlib.Path(self.label_root)} ")
                    file_to_read = pathlib.Path(self.label_root) / f"{label_file.stem}.json"
                else:
                    print(f"[LOADER] file type not supported")
                    df = None                    

                try:
                    df = self._load_dataframe(file_to_read)
                except FileNotFoundError as exc:
                    print(f"[LOADER] could not create dataframe for {file_to_read}")
                
                if df is not None:
                    X, y = self._prepare_X_y(df)
                    ret.append((X,y,file_to_read.stem))
        
        return ret