import al_clusterer
from al_label_load import LabelLoader
import numpy as np
from pathlib import Path


if __name__ == "__main__":

    processor = LabelLoader(
    label_root="data/labels",
    motion_root="data/npy",
    cache_root="data/labels"
    )
    X, y, scaler = processor.load("andy_60_re.json")

    y_flat = y.reshape(y.shape[0], -1)
    y_flat_str = np.array(["_".join(map(str, r)) for r in y_flat])
    y = y_flat_str


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
    print(f"k‑means fitted – silhouette={sil:.4f}")

    # -------------------------------------------------------------
    # Evaluate
    # -------------------------------------------------------------
    evaluator.evaluate(labels)
    print(evaluator.summary())


