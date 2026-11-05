import al_clusterer
from al_label_load import LabelLoader
import al_label_load
import numpy as np
from pathlib import Path
import argparse
from datetime import datetime, timezone
import json
import re
import uuid




if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("filename")
    args = parser.parse_args()

    filename = args.filename

    print(f"loading: {filename}")

    processor = LabelLoader(
    label_root="data/labels",
    motion_root="data/npy",
    cache_root="data/labels"
    )
    X, y, scaler = processor.load(f"{filename}.json")

    y_flat = y.reshape(y.shape[0], -1)
    y_flat_str = np.array(['_'.join(map(str, al_label_load.redo_one_hot(arr, 8, 3))) for arr in y_flat])
    a = 1
    #y_flat_str = np.array(["_".join(map(str, r)) for r in y_flat])  
    

    # dimension reducer – switch between PCA and AE by changing the class
    # reducer = PCAReducer(n_components=6)
    reducer = al_clusterer.AutoEncoderReducer(
        encoding_dim=32,
        hidden_layers=(256,64),
        epochs=500,          # fewer epochs for the demo
        batch_size=128,
        verbose=1,
    )
    reducer = al_clusterer.PCAReducer(
        n_components = 6,
        random_state = 42
    )

    # clustering algorithm
    clusterer = al_clusterer.KMeansClusterer(n_clusters=40, random_state=42)

    # evaluator – thresholds can be tweaked per experiment
    evaluator = al_clusterer.ClusterEvaluator(
        y_true=y_flat_str,  # placeholder – will be replaced after loading
        min_cluster_size=5,
        precision_thr=0.7,
        recall_thr=0.01,
    )


    # -------------------------------------------------------------
    # Reduce Dimension
    # -------------------------------------------------------------
    X_red, reducer_obj = reducer.fit_transform(X)
    print(f"[✔] Reduced to {X_red.shape[1]} dimensions")

    # -------------------------------------------------------------
    # Cluster 
    # -------------------------------------------------------------
    clusterer.fit(X_red)
    labels = clusterer.predict(X_red)
    sil = clusterer.silhouette(X_red, labels)
    print(f"k-means fitted - silhouette={sil:.4f}")

    # -------------------------------------------------------------
    # Evaluate
    # -------------------------------------------------------------
    evaluator.evaluate(labels)
    print(evaluator.summary())

    # -------------------------------------------------------------
    # Save models and evaluator-qualified cluster IDs
    # -------------------------------------------------------------
    dataset_slug = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(filename).name).strip("._-")
    dataset_slug = dataset_slug or "dataset"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    config_name = f"{dataset_slug}_{timestamp}_{uuid.uuid4().hex}"
    config_dir = Path(__file__).resolve().parent / "models" / config_name
    config_dir.mkdir(parents=True, exist_ok=False)

    reducer_path = reducer.save(reducer_obj, config_dir, "reducer")
    clusterer_path = clusterer.save(config_dir, "clusterer")
    relevant_cluster_ids = [cluster.cluster_id for cluster in evaluator.valid_clusters]

    config = {
        "config_name": config_name,
        "dataset": filename,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "reducer": {
            "type": type(reducer).__name__,
            "parameters": {
                key: value for key, value in vars(reducer).items()
                if not key.startswith("_")
            },
            "artifact": reducer_path.name,
        },
        "clusterer": {
            "type": type(clusterer).__name__,
            "parameters": {
                key: value for key, value in vars(clusterer).items()
                if not key.startswith("_")
            },
            "artifact": clusterer_path.name,
        },
        "evaluator": {
            "min_cluster_size": evaluator.min_cluster_size,
            "precision_threshold": evaluator.precision_thr,
            "recall_threshold": evaluator.recall_thr,
            "relevant_cluster_ids": relevant_cluster_ids,
        },
    }
    with (config_dir / "config.json").open("w", encoding="utf-8") as config_file:
        json.dump(config, config_file, indent=2)
        config_file.write("\n")

    print(f"Saved model config: {config_dir}")


