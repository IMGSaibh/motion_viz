from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from backend.autolabel import al_clusterer, al_label_load, al_utils
from backend.autolabel.al_label_load import LabelLoader

class PerformClustering:
    """Load a labelled motion dataset and evaluate clustering configurations."""

    def __init__(
        self,
        X,y,
        filenames: list,
        label_root: str | Path | None = None,
        motion_root: str | Path | None = None,
        cache_root: str | Path | None = None,
        models_root: str | Path | None = None,
    ) -> None:
        repo_root = Path(__file__).resolve().parents[3]
        self.label_root = Path(label_root) if label_root else repo_root / "data" / "labels"
        self.motion_root = Path(motion_root) if motion_root else repo_root / "data" / "npy"
        self.cache_root = Path(cache_root) if cache_root else self.label_root
        self.models_root = (
            Path(models_root)
            if models_root
            else Path(__file__).resolve().parent / "models"
        )
        self.pathname = "_".join(Path(f).stem for f in filenames)        
        self.X = X
        self.y = y

    def run(
        self,
        reducer: al_clusterer.BaseReducer,
        clusterer: al_clusterer.BaseClusterer,
        min_cluster_size: int = 5,
        precision_threshold: float = 0.9,
        recall_threshold: float = 0.01,
    ) -> dict[str, Any]:
        """Fit, evaluate, and save one reducer/clusterer configuration."""


        reduced_features, reducer_model = reducer.fit_transform(self.X)
        clusterer.fit(reduced_features)
        cluster_labels = clusterer.predict(reduced_features)
        silhouette = clusterer.silhouette(reduced_features, cluster_labels)

        evaluator = al_clusterer.ClusterEvaluator(
            y_true=self.y,
            min_cluster_size=min_cluster_size,
            precision_thr=precision_threshold,
            recall_thr=recall_threshold,
        )
        evaluator.evaluate(cluster_labels)

        dataset_slug = re.sub(
            r"[^A-Za-z0-9._-]+", "_", self.pathname
        ).strip("._-") or "dataset"
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        config_name = f"{dataset_slug}_{timestamp}_{uuid.uuid4().hex[:8]}"
        config_dir = self.models_root / config_name
        config_dir.mkdir(parents=True, exist_ok=False)

        reducer_path = reducer.save(reducer_model, config_dir, "reducer")
        clusterer_path = clusterer.save(config_dir, "clusterer")
        relevant_cluster_id_label = {
            cluster.cluster_id: str(cluster.dominant_label)
            for cluster in evaluator.valid_clusters
        }
        config = {
            "config_name": config_name,
            "dataset": self.pathname,
            "created_at_utc": datetime.now(timezone.utc).isoformat(),
            "reducer": {
                "type": type(reducer).__name__,
                "parameters": {
                    key: value
                    for key, value in vars(reducer).items()
                    if not key.startswith("_")
                },
                "artifact": reducer_path.name,
            },
            "clusterer": {
                "type": type(clusterer).__name__,
                "parameters": {
                    key: value
                    for key, value in vars(clusterer).items()
                    if not key.startswith("_")
                },
                "artifact": clusterer_path.name,
            },
            "evaluator": {
                "min_cluster_size": evaluator.min_cluster_size,
                "precision_threshold": evaluator.precision_thr,
                "recall_threshold": evaluator.recall_thr,
                "relevant_cluster_id_label": relevant_cluster_id_label,
            },
        }
        with (config_dir / "config.json").open("w", encoding="utf-8") as config_file:
            json.dump(config, config_file, indent=2)
            config_file.write("\n")

        valid_frame_count = sum(
            cluster.size for cluster in evaluator.valid_clusters
        )
        total_frame_count = sum(cluster.size for cluster in evaluator.all_clusters)
        return {
            "config_name": config_name,
            "silhouette": silhouette,
            "valid_clusters": len(evaluator.valid_clusters),
            "valid_frame_ratio": (
                valid_frame_count / total_frame_count if total_frame_count else 0.0
            ),
            "config_dir": str(config_dir),
        }