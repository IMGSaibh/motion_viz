from __future__ import annotations

from statistics import fmean, pstdev
from pathlib import Path

from backend.autolabel.al_clusterer import (
    AutoEncoderReducer,
    KMeansClusterer,
    PCAReducer,
)
from backend.autolabel.al_label_load import LabelLoader

from backend.autolabel.perform_data_clustering import PerformClustering

from backend.autolabel.al_clusterer import (
    AutoEncoderReducer,
    KMeansClusterer,
    PCAReducer,
)


FILENAMES = ["/home/edscher/hack/motion_viz/data/labels"]
USE_PCA = True
PCA_COMPONENTS = 6
AUTOENCODER_CONFIG = {
    "encoding_dim": 16,
    "hidden_layers": (256,),
    "epochs": 500,
    "batch_size": 256,
}
KMEANS_N_CLUSTERS = 5
MIN_CLUSTER_SIZE = 10
PRECISION_THRESHOLD = 0.95
RECALL_THRESHOLD = 0.0
RANDOM_STATE = 42
N_REPEATS = 1


def main() -> None:
    repo_root = Path(__file__).resolve().parents[3]
    label_root = repo_root / "data" / "labels"
    motion_root = repo_root / "data" / "npy"
    cache_root = label_root

    loader = LabelLoader(cache_root=cache_root, label_root=label_root, motion_root=motion_root)
    loaded_files = loader.load(FILENAMES)
    X,y = loader.get_data(loaded_files)
    
    experiment = PerformClustering(filenames=FILENAMES, X=X, y=y)

    reducer_type = "PCA" if USE_PCA else "AutoEncoder"
    reducer_parameters = (
        {"n_components": PCA_COMPONENTS} if USE_PCA else AUTOENCODER_CONFIG
    )
    trial_results = []

    for repeat in range(N_REPEATS):
        print(f"--- Repeat No.{repeat}")
        random_state = RANDOM_STATE + repeat
        parameters = {
            **reducer_parameters,
            "random_state": random_state,
        }
        if USE_PCA:
            print(f"--- Using PCA")
            reducer = PCAReducer(**parameters)
        else:
            print(f"--- Using AE")
            reducer = AutoEncoderReducer(**parameters)
            
        clusterer = KMeansClusterer(
            n_clusters=KMEANS_N_CLUSTERS,
            random_state=random_state,
        )
        print(f"--- Clustering {KMEANS_N_CLUSTERS} clusters")
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
        print(f"--- Completed repeat {repeat + 1}/{N_REPEATS}: {result['config_name']}")

    if len(trial_results) != N_REPEATS:
        raise RuntimeError(
            f"--- Completed {len(trial_results)}/{N_REPEATS} repeats; "
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
        f"\n--- {reducer_type}={reducer_parameters}, "
        f"\n--- KMeans={KMEANS_N_CLUSTERS}, n={N_REPEATS}: "
        f"\n--- silhouette={means['silhouette']:.4f} +/- "
        f"{deviations['silhouette']:.4f}, "
        f"\n--- valid_clusters={means['valid_clusters']:.2f} +/- "
        f"{deviations['valid_clusters']:.2f}, "
        f"\n--- valid_frame_ratio={means['valid_frame_ratio']:.1%} +/- "
        f"{deviations['valid_frame_ratio']:.1%}"
    )


if __name__ == "__main__":
    main()