from __future__ import annotations

from itertools import product
from statistics import fmean, pstdev
from pathlib import Path

from backend.autolabel.al_clusterer import (
    AutoEncoderReducer,
    KMeansClusterer,
    PCAReducer,
)

from backend.autolabel.al_label_load import LabelLoader

from backend.autolabel.perform_data_clustering import PerformClustering


FILENAMES = ["xsens_002_WS10_2023_09_21_cropped.json"]
PCA_COMPONENTS = (4, 6, 8)
AUTOENCODER_CONFIGS = (
    {"encoding_dim": 16,  "hidden_layers": (16,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 32,  "hidden_layers": (16,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 32,  "hidden_layers": (32,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (16,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (32,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (64,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (32, 16),    "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (64, 32),    "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 128, "hidden_layers": (32,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 128, "hidden_layers": (64,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 128, "hidden_layers": (64, 32),    "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 128, "hidden_layers": (128, 64),   "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 256, "hidden_layers": (64,),       "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 256, "hidden_layers": (128,),      "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 256, "hidden_layers": (128, 64),   "epochs": 500,  "batch_size": 32},
    {"encoding_dim": 32,  "hidden_layers": (16,),       "epochs": 1000, "batch_size": 32},
    {"encoding_dim": 64,  "hidden_layers": (32, 16),    "epochs": 1000, "batch_size": 32},
    {"encoding_dim": 128, "hidden_layers": (64, 32),    "epochs": 1000, "batch_size": 64},
    {"encoding_dim": 64,  "hidden_layers": (32,),       "epochs": 500,  "batch_size": 16},
    {"encoding_dim": 128, "hidden_layers": (64, 32),    "epochs": 500,  "batch_size": 64},
)


KMEANS_CLUSTERS = (20, 40, 60)
MIN_CLUSTER_SIZE = 5
PRECISION_THRESHOLD = 0.9
RECALL_THRESHOLD = 0.01
RANDOM_STATE = 42
N_REPEATS = 5


def main() -> None:
    
    repo_root = Path(__file__).resolve().parents[3]
    label_root = repo_root / "data" / "labels"
    motion_root = repo_root / "data" / "npy"
    cache_root = label_root

    FILENAMES = [motion_root]

    loader = LabelLoader(cache_root=cache_root, label_root=label_root, motion_root=motion_root)
    loaded_files = loader.load(FILENAMES)
    X,y = loader.get_data(loaded_files)
    
    experiment = PerformClustering(filenames=FILENAMES, X=X, y=y)
    results = []
    reducer_configs = (
        [
            ("PCA", {"n_components": components})
            for components in PCA_COMPONENTS
        ]
        + [("AutoEncoder", config) for config in AUTOENCODER_CONFIGS]
    )

    for reducer_type, reducer_parameters in reducer_configs:
        for clusters in KMEANS_CLUSTERS:
            trial_results = []
            for repeat in range(N_REPEATS):
                random_state = RANDOM_STATE + repeat
                parameters = {
                    **reducer_parameters,
                    "random_state": random_state,
                }
                if reducer_type == "PCA":
                    reducer = PCAReducer(**parameters)
                else:
                    reducer = AutoEncoderReducer(**parameters)
                clusterer = KMeansClusterer(
                    n_clusters=clusters, random_state=random_state
                )
                try:
                    trial_results.append(
                        experiment.run(
                            reducer,
                            clusterer,
                            min_cluster_size=MIN_CLUSTER_SIZE,
                            precision_threshold=PRECISION_THRESHOLD,
                            recall_threshold=RECALL_THRESHOLD,
                        )
                    )
                except (ValueError, RuntimeError) as error:
                    print(
                        f"Failed {reducer_type}={reducer_parameters}, "
                        f"KMeans={clusters}, repeat={repeat + 1}/{N_REPEATS}: {error}"
                    )

            if len(trial_results) != N_REPEATS:
                print(
                    f"Skipped summary for {reducer_type}={reducer_parameters}, "
                    f"KMeans={clusters}: completed {len(trial_results)}/{N_REPEATS} repeats"
                )
                continue

            metrics = ("silhouette", "valid_clusters", "valid_frame_ratio")
            means = {
                metric: fmean(result[metric] for result in trial_results)
                for metric in metrics
            }
            deviations = {
                metric: pstdev(result[metric] for result in trial_results)
                for metric in metrics
            }
            summary = {
                "config_name": trial_results[-1]["config_name"],
                "reducer_type": reducer_type,
                "reducer_parameters": reducer_parameters,
                "clusters": clusters,
                "means": means,
                "deviations": deviations,
                "trial_configs": [
                    result["config_name"] for result in trial_results
                ],
            }
            results.append(summary)
            print(
                f"{reducer_type}={reducer_parameters}, KMeans={clusters}, "
                f"n={N_REPEATS}: "
                f"silhouette={means['silhouette']:.4f} +/- "
                f"{deviations['silhouette']:.4f}, "
                f"valid_clusters={means['valid_clusters']:.2f} +/- "
                f"{deviations['valid_clusters']:.2f}, "
                f"valid_frame_ratio={means['valid_frame_ratio']:.1%} +/- "
                f"{deviations['valid_frame_ratio']:.1%}"
            )

    if results:
        best = max(results, key=lambda result: result["means"]["silhouette"])
        print(
            f"Best mean silhouette: {best['reducer_type']}="
            f"{best['reducer_parameters']}, KMeans={best['clusters']} "
            f"({best['means']['silhouette']:.4f} +/- "
            f"{best['deviations']['silhouette']:.4f})"
        )
    else:
        raise RuntimeError("no parameter combinations completed successfully")


if __name__ == "__main__":
    main()