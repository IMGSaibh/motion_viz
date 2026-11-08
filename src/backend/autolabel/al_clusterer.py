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
import pickle
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union

import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

from tensorflow.keras.models import Model


# ------------------------------------------------------------------- #
# Dimension‑reducer
# ------------------------------------------------------------------- #
class BaseReducer(ABC):
    """Abstract reducer - subclasses must implement ``fit_transform``."""

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
        with path.open("wb") as file:
            pickle.dump(reducer_obj, file)
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
    random_state: int = 42

    # -----------------------------------------------------------------
    # Helper – build the Keras model
    # -----------------------------------------------------------------
    def _build_ae(self, input_dim: int) -> Model:
        from tensorflow.keras.layers import Input, Dense, LeakyReLU
        

        inp = Input(shape=(input_dim,))
        x = inp
        if not hasattr(self.hidden_layers, '__iter__'):
            self.hidden_layers = [self.hidden_layers]
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
        import tensorflow as tf
        from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

        gpus = tf.config.list_physical_devices("GPU")
        device = "/GPU:0" if gpus else "/CPU:0"
        tf.keras.utils.set_random_seed(self.random_state)

        print(f"GPUs found: {gpus}")

        callbacks = [
            EarlyStopping(monitor="val_loss", patience=15, restore_best_weights=True),
            ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6, verbose=1),
        ]

        with tf.device(device):
            ae = self._build_ae(X.shape[1])
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
# Clusterer
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
        """Persist the fitted model and return the file path."""
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
        with path.open("wb") as file:
            pickle.dump(self._model, file)
        return path


# ------------------------------------------------------------------- #
# Cluster evaluator
# ------------------------------------------------------------------- #
@dataclass
class ClusterEval:
    """Per-cluster evaluation metrics."""
    cluster_id: int
    size: int
    dominant_label: Any
    precision: float
    recall: float
    label_counts: Dict[Any, int] = field(default_factory=dict)


class BaseClusterEvaluator(ABC):
    """Shared cluster evaluation workflow and reporting."""

    y_true_file_type = "npy"

    def __init__(
        self,
        y_true: Any,
        min_cluster_size: int = 5,
        precision_thr: float = 0.5,
        recall_thr: float = 0.5,
    ):
        self.y_true = self._load_y_true(y_true)
        self.min_cluster_size = min_cluster_size
        self.precision_thr = precision_thr
        self.recall_thr = recall_thr
        self.all_clusters: List[ClusterEval] = []
        self.valid_clusters: List[ClusterEval] = []
      


    def _load_y_true(self, y_true: Any) -> Any:
        if not isinstance(y_true, (str, Path)):
            return y_true

        path = Path(y_true)
        if self.y_true_file_type == "npy":
            return np.load(path, allow_pickle=False)
        if self.y_true_file_type == "json":
            with path.open("r", encoding="utf-8") as file:
                return json.load(file)
        raise ValueError(
            f"Unsupported y_true_file_type: {self.y_true_file_type!r}"
        )

    @abstractmethod
    def _evaluate_one(self, cluster_labels: np.ndarray, cid: int) -> ClusterEval:
        """Return metrics for one cluster."""
        ...

    def evaluate(self, cluster_labels: np.ndarray) -> None:
        """Populate ``self.all_clusters`` and ``self.valid_clusters``."""
        self.all_clusters = [
            self._evaluate_one(cluster_labels, int(cid))
            for cid in np.unique(cluster_labels)
        ]
        self.valid_clusters = [
            cluster
            for cluster in self.all_clusters
            if cluster.size >= self.min_cluster_size
            and cluster.precision >= self.precision_thr
            and cluster.recall >= self.recall_thr
        ]

    def summary(self) -> str:
        """Plain-text table that you can ``print``."""
        lines = [
            "\n=== ALL CLUSTERS (sorted by precision) ===",
            f"{'ID':>4} {'Prec.':>6} {'Rec.':>6} {'Size':>5} Dominant (* = valid)",
            "-" * 44,
        ]
        valid_cluster_ids = {cluster.cluster_id for cluster in self.valid_clusters}
        for cluster in sorted(
            self.all_clusters, key=lambda item: item.precision, reverse=True
        ):
            marker = " *" if cluster.cluster_id in valid_cluster_ids else ""
            lines.append(
                f"{cluster.cluster_id:>4} {cluster.precision:6.3f} "
                f"{cluster.recall:6.3f} {cluster.size:5d} "
                f"{cluster.dominant_label}{marker}"
            )

        if self.valid_clusters:
            avg_prec = np.mean([cluster.precision for cluster in self.valid_clusters])
            avg_rec = np.mean([cluster.recall for cluster in self.valid_clusters])
        else:
            avg_prec = avg_rec = 0.0

        valid_frame_count = sum(cluster.size for cluster in self.valid_clusters)
        all_frame_count = sum(cluster.size for cluster in self.all_clusters)
        valid_frame_ratio = (
            valid_frame_count / all_frame_count if all_frame_count else 0.0
        )

        lines.extend(
            [
                "\n=== VALID-CLUSTER SUMMARY ===",
                f"Requested clusters   : {len(self.all_clusters)}",
                f"Valid clusters found : {len(self.valid_clusters)}",
                f"Frames in valid      : {valid_frame_count} ({valid_frame_ratio:.1%})",
                f"Avg precision (valid): {avg_prec:.4f}",
                f"Avg recall (valid)   : {avg_rec:.4f}",
            ]
        )
        return "\n".join(lines)

    def as_dict(self) -> Dict[str, Any]:
        """JSON-serialisable representation (handy for logging)."""
        return {
            "all_clusters": [asdict(cluster) for cluster in self.all_clusters],
            "valid_clusters": [asdict(cluster) for cluster in self.valid_clusters],
        }

class ClusterEvaluator(BaseClusterEvaluator):
    """Compute precision/recall per cluster using the dominant label."""

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

class ClusterEvaluatorMultiCat(BaseClusterEvaluator):
    """Compute precision/recall per cluster using the dominant label."""

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





