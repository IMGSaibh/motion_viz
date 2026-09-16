#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Modular clustering toolkit.

Four interchangeable components:

1️⃣  Loader                – reads X, y.
2️⃣  DimensionReducer      – PCA or Auto‑Encoder.
3️⃣  Clusterer             – K‑means (or any other algorithm).
4️⃣  ClusterEvaluator      – precision/recall per cluster.

All classes have a very small public API, which makes them trivial to
reuse in grid‑searches, notebooks, or production pipelines.
"""

from __future__ import annotations

import os
import json
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union

import joblib
import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from tensorflow.keras.models import Model

# ------------------------------------------------------------------- #
# 1️⃣  Loader
# ------------------------------------------------------------------- #
class BaseLoader(ABC):
    """Abstract loader – subclasses must implement ``load``."""

    @abstractmethod
    def load(self) -> Tuple[np.ndarray, np.ndarray]:
        """Return (X, y) where

        * ``X`` – numeric feature matrix, shape (n_samples, n_features)
        * ``y`` – ground‑truth labels, shape (n_samples,)
        """
        ...


# ------------------------------------------------------------------- #
# Concrete wrapper around the *your* existing `LabelLoader`.  This is
# deliberately tiny – you can replace it with any other data source.
# ------------------------------------------------------------------- #
class LabelLoaderAdapter(BaseLoader):
    """
    Adapter that turns the ``al_label_load.LabelLoader`` class into a
    ``BaseLoader`` implementation.

    Parameters
    ----------
    json_file : str | Path
        The JSON file you want to read (relative to ``label_root``).
    label_root, motion_root, cache_root : Path
        Same arguments you already pass to ``LabelLoader``.
    """

    def __init__(
        self,
        json_file: Union[str, Path],
        label_root: Union[str, Path] = "data/labels",
        motion_root: Union[str, Path] = "data/npy",
        cache_root: Union[str, Path] = "data/labels",
    ):
        from al_label_load import LabelLoader  # local import to avoid hard dependency

        self.json_file = Path(json_file)
        self.loader = LabelLoader(
            label_root=Path(label_root),
            motion_root=Path(motion_root),
            cache_root=Path(cache_root),
        )

    def load(self) -> Tuple[np.ndarray, np.ndarray]:
        X, y, _ = self.loader.load(str(self.json_file))

        # Flatten the label tensor and collapse each row into a single string.
        y_flat = y.reshape(y.shape[0], -1)
        y_str = np.array(["_".join(map(str, row)) for row in y_flat])
        return X.astype(np.float32), y_str


# ------------------------------------------------------------------- #
# 2️⃣  Dimension‑reducer
# ------------------------------------------------------------------- #
class BaseReducer(ABC):
    """Abstract reducer – subclasses must implement ``fit_transform``."""

    @abstractmethod
    def fit_transform(self, X: np.ndarray) -> Tuple[np.ndarray, Any]:
        """
        Reduce ``X`` and return a tuple ``(X_reduced, reducer_object)``.
        ``reducer_object`` is whatever you need later to re‑use the model
        (e.g. a fitted PCA instance or a Keras Model).
        """
        ...

    @abstractmethod
    def save(self, reducer_obj: Any, out_dir: Path, stem: str) -> Path:
        """Persist the fitted reducer and return the saved file path."""
        ...


# ------------------------------------------------------------------- #
# PCA implementation
# ------------------------------------------------------------------- #
@dataclass
class PCAReducer(BaseReducer):
    n_components: int = 6
    random_state: int = 42

    def fit_transform(self, X: np.ndarray) -> Tuple[np.ndarray, PCA]:
        pca = PCA(n_components=self.n_components, random_state=self.random_state)
        X_red = pca.fit_transform(X)
        return X_red, pca

    def save(self, reducer_obj: PCA, out_dir: Path, stem: str) -> Path:
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / f"{stem}_pca.pkl"
        joblib.dump(reducer_obj, path)
        return path


# ------------------------------------------------------------------- #
# Auto‑Encoder implementation (TensorFlow / Keras)
# ------------------------------------------------------------------- #
@dataclass
class AutoEncoderReducer(BaseReducer):
    encoding_dim: int = 8
    hidden_layers: Tuple[int, ...] = (256,)
    epochs: int = 500
    batch_size: int = 128
    verbose: int = 0

    # -----------------------------------------------------------------
    # Helper – build the Keras model
    # -----------------------------------------------------------------
    def _build_ae(self, input_dim: int) -> Model:
        from tensorflow.keras.layers import Input, Dense, LeakyReLU
        

        inp = Input(shape=(input_dim,))
        x = inp
        for units in self.hidden_layers:
            x = Dense(units)(x)
            x = LeakyReLU(alpha=0.1)(x)

        bottleneck = Dense(self.encoding_dim, name="bottleneck")(x)

        # decoder (mirrored)
        x = bottleneck
        for units in reversed(self.hidden_layers):
            x = Dense(units)(x)
            x = LeakyReLU(alpha=0.1)(x)

        out = Dense(input_dim)(x)
        ae = Model(inp, out)
        ae.compile(optimizer="adam", loss="mse")
        return ae

    # -----------------------------------------------------------------
    def fit_transform(self, X: np.ndarray) -> Tuple[np.ndarray, Model]:
        from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

        ae = self._build_ae(X.shape[1])

        callbacks = [
            EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True),
            ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6, verbose=1),
        ]

        ae.fit(
            X,
            X,
            epochs=self.epochs,
            batch_size=self.batch_size,
            shuffle=True,
            verbose=self.verbose,
            callbacks=callbacks,
        )

        encoder = Model(ae.input, ae.get_layer("bottleneck").output)
        X_red = encoder.predict(X, batch_size=256, verbose=0)
        return X_red, ae

    # -----------------------------------------------------------------
    def save(self, reducer_obj: Model, out_dir: Path, stem: str) -> Path:
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / f"{stem}_ae.keras"
        reducer_obj.save(path)
        return path


# ------------------------------------------------------------------- #
# 3️⃣  Clusterer
# ------------------------------------------------------------------- #
class BaseClusterer(ABC):
    """Abstract clustering algorithm."""

    @abstractmethod
    def fit(self, X: np.ndarray) -> None:
        """Fit the clustering model on ``X``."""
        ...

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Return cluster labels for each row of ``X``."""
        ...

    @abstractmethod
    def silhouette(self, X: np.ndarray, labels: np.ndarray) -> float:
        """Return the silhouette score for the given clustering."""
        ...

    @abstractmethod
    def save(self, out_dir: Path, stem: str) -> Path:
        """Persist the fitted model (joblib) and return the file path."""
        ...


# ------------------------------------------------------------------- #
# K‑means implementation – the default you asked for
# ------------------------------------------------------------------- #
@dataclass
class KMeansClusterer(BaseClusterer):
    n_clusters: int = 20
    random_state: int = 42
    n_init: int = 10

    # internal attribute – filled after ``fit`` is called
    _model: KMeans | None = field(init=False, default=None)

    def fit(self, X: np.ndarray) -> None:
        self._model = KMeans(
            n_clusters=self.n_clusters,
            random_state=self.random_state,
            n_init=self.n_init,
        )
        self._model.fit(X)

    def predict(self, X: np.ndarray) -> np.ndarray:
        if self._model is None:
            raise RuntimeError("Call .fit() before .predict().")
        return self._model.predict(X)

    def silhouette(self, X: np.ndarray, labels: np.ndarray) -> float:
        return silhouette_score(X, labels)

    def save(self, out_dir: Path, stem: str) -> Path:
        if self._model is None:
            raise RuntimeError("Fit the model before saving.")
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / f"{stem}_kmeans.pkl"
        joblib.dump(self._model, path)
        return path


# ------------------------------------------------------------------- #
# 4️⃣  Cluster evaluator
# ------------------------------------------------------------------- #
@dataclass
class ClusterEval:
    """Per‑cluster evaluation metrics."""
    cluster_id: int
    size: int
    dominant_label: Any
    precision: float
    recall: float
    label_counts: Dict[Any, int] = field(default_factory=dict)


class ClusterEvaluator:
    """
    Compute precision/recall per cluster and expose a few convenience
    methods (summary table, JSON‑serialisable dict, …​).
    """

    def __init__(
        self,
        y_true: np.ndarray,
        min_cluster_size: int = 5,
        precision_thr: float = 0.5,
        recall_thr: float = 0.5,
    ):
        self.y_true = y_true
        self.min_cluster_size = min_cluster_size
        self.precision_thr = precision_thr
        self.recall_thr = recall_thr

        self.all_clusters: List[ClusterEval] = []
        self.valid_clusters: List[ClusterEval] = []

    # -----------------------------------------------------------------
    def _evaluate_one(self, cluster_labels: np.ndarray, cid: int) -> ClusterEval:
        mask = cluster_labels == cid
        size = int(mask.sum())

        if size < self.min_cluster_size:
            return ClusterEval(
                cluster_id=cid,
                size=size,
                dominant_label=None,
                precision=0.0,
                recall=0.0,
                label_counts={},
            )

        labels, counts = np.unique(self.y_true[mask], return_counts=True)
        dominant = labels[np.argmax(counts)]

        tp = int(counts.max())
        fp = size - tp
        fn = int((self.y_true == dominant).sum()) - tp

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        label_counts = dict(zip(labels, counts.astype(int)))

        return ClusterEval(
            cluster_id=cid,
            size=size,
            dominant_label=dominant,
            precision=precision,
            recall=recall,
            label_counts=label_counts,
        )

    # -----------------------------------------------------------------
    def evaluate(self, cluster_labels: np.ndarray) -> None:
        """Populate ``self.all_clusters`` and ``self.valid_clusters``."""
        self.all_clusters = [
            self._evaluate_one(cluster_labels, int(cid))
            for cid in np.unique(cluster_labels)
        ]

        self.valid_clusters = [
            c
            for c in self.all_clusters
            if (c.size >= self.min_cluster_size)
            and (c.precision >= self.precision_thr)
            and (c.recall >= self.recall_thr)
        ]

    # -----------------------------------------------------------------
    def summary(self) -> str:
        """Plain‑text table that you can ``print``."""
        lines = [
            "\n=== ALL CLUSTERS (sorted by precision) ===",
            f"{'ID':>4} {'Prec.':>6} {'Rec.':>6} {'Size':>5} Dominant",
            "-" * 44,
        ]

        for c in sorted(self.all_clusters, key=lambda x: x.precision, reverse=True):
            lines.append(
                f"{c.cluster_id:>4} {c.precision:6.3f} {c.recall:6.3f} "
                f"{c.size:5d} {c.dominant_label}"
            )

        # Global stats for the *valid* clusters
        if self.valid_clusters:
            avg_prec = np.mean([c.precision for c in self.valid_clusters])
            avg_rec = np.mean([c.recall for c in self.valid_clusters])
        else:
            avg_prec = avg_rec = 0.0

        lines.extend(
            [
                "\n=== VALID‑CLUSTER SUMMARY ===",
                f"Requested clusters   : {len(self.all_clusters)}",
                f"Valid clusters found : {len(self.valid_clusters)}",
                f"Avg precision (valid): {avg_prec:.4f}",
                f"Avg recall (valid)   : {avg_rec:.4f}",
            ]
        )
        return "\n".join(lines)

    # -----------------------------------------------------------------
    def as_dict(self) -> Dict[str, Any]:
        """JSON‑serialisable representation (handy for logging)."""
        return {
            "all_clusters": [asdict(c) for c in self.all_clusters],
            "valid_clusters": [asdict(c) for c in self.valid_clusters],
        }





