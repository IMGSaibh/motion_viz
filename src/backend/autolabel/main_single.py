from __future__ import annotations

from statistics import fmean, pstdev

from backend.autolabel.al_clusterer import (
    AutoEncoderReducer,
    KMeansClusterer,
    PCAReducer,
)
from backend.autolabel.perform_data_clustering import PerformClustering


FILENAME = "xsens_002_WS10_2023_09_21_cropped.json"
USE_PCA = False
PCA_COMPONENTS = 6
AUTOENCODER_CONFIG = {
    "encoding_dim": 16,
    "hidden_layers": (256,),
    "epochs": 500,
    "batch_size": 256,
}
KMEANS_N_CLUSTERS = 60
MIN_CLUSTER_SIZE = 10
PRECISION_THRESHOLD = 0.95
RECALL_THRESHOLD = 0.01
RANDOM_STATE = 42
N_REPEATS = 5


def main() -> None:
    experiment = PerformClustering(FILENAME)
    reducer_type = "PCA" if USE_PCA else "AutoEncoder"
    reducer_parameters = (
        {"n_components": PCA_COMPONENTS} if USE_PCA else AUTOENCODER_CONFIG
    )
    trial_results = []

    for repeat in range(N_REPEATS):
        random_state = RANDOM_STATE + repeat
        parameters = {
            **reducer_parameters,
            "random_state": random_state,
        }
        if USE_PCA:
            reducer = PCAReducer(**parameters)
        else:
            reducer = AutoEncoderReducer(**parameters)
        clusterer = KMeansClusterer(
            n_clusters=KMEANS_N_CLUSTERS,
            random_state=random_state,
        )
        try:
            result = experiment.run(
                reducer,
                clusterer,
                min_cluster_size=MIN_CLUSTER_SIZE,
                precision_threshold=PRECISION_THRESHOLD,
                recall_threshold=RECALL_THRESHOLD,
            )
        except (ValueError, RuntimeError) as error:
            print(f"Failed repeat {repeat + 1}/{N_REPEATS}: {error}")
            continue
        trial_results.append(result)
        print(f"Completed repeat {repeat + 1}/{N_REPEATS}: {result['config_name']}")

    if len(trial_results) != N_REPEATS:
        raise RuntimeError(
            f"Completed {len(trial_results)}/{N_REPEATS} repeats; "
            "cannot calculate a complete summary"
        )

    metrics = ("silhouette", "valid_clusters", "valid_frame_ratio")
    means = {
        metric: fmean(result[metric] for result in trial_results)
        for metric in metrics
    }
    deviations = {
        metric: pstdev(result[metric] for result in trial_results)
        for metric in metrics
    }
    print(
        f"\n{reducer_type}={reducer_parameters}, "
        f"\nKMeans={KMEANS_N_CLUSTERS}, n={N_REPEATS}: "
        f"\nsilhouette={means['silhouette']:.4f} +/- "
        f"{deviations['silhouette']:.4f}, "
        f"\nvalid_clusters={means['valid_clusters']:.2f} +/- "
        f"{deviations['valid_clusters']:.2f}, "
        f"\nvalid_frame_ratio={means['valid_frame_ratio']:.1%} +/- "
        f"{deviations['valid_frame_ratio']:.1%}"
    )


if __name__ == "__main__":
    main()