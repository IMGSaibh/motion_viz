import argparse
import json
import pickle
from pathlib import Path

import numpy as np

from al_label_load import LabelLoader


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument('-m', '--modelconfig', required=True, help='name of model config')
    parser.add_argument('-l', '--labelfile', required=True, help='label JSON filename')
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[3]
    autolabel_root = Path(__file__).resolve().parent
    labels_root = repo_root / "data" / "labels"
    motion_root = repo_root / "data" / "npy"

    

    models_root = autolabel_root / "models"
    if args.modelconfig == "recent":
        model_dirs = [
            path
            for path in models_root.iterdir()
            if path.is_dir() and (path / "config.json").is_file()
        ] if models_root.is_dir() else []
        if not model_dirs:
            parser.error(f"no model configs found in: {models_root}")
        config_dir = max(model_dirs, key=lambda path: path.stat().st_mtime)
        print(f"Selected most recent model config: {config_dir.name}")
    else:
        config_dir = models_root / args.modelconfig
    config_path = config_dir / "config.json"
    if not config_path.is_file():
        parser.error(f"model config not found: {config_path}")
    print(f"Loading model config: {config_path}")
    with config_path.open("r", encoding="utf-8") as config_file:
        config = json.load(config_file)

    label_path = Path(args.labelfile)
    if not label_path.is_absolute():
        label_path = labels_root / label_path
    if label_path.suffix.lower() != ".json":
        label_path = label_path.with_suffix(".json")
    if not label_path.is_file():
        parser.error(f"label file not found: {label_path}")

    motion_path = motion_root / f"{label_path.stem}.npy"
    if not motion_path.is_file():
        parser.error(f"motion file not found: {motion_path}")

    # Predict over every motion frame, not only frames already covered by labels.
    print(f"Loading labels: {label_path}")
    print(f"Loading motion: {motion_path}")
    loader = LabelLoader(labels_root, motion_root, labels_root)
    source_labels = loader._load_label_json(label_path)
    rotations, _positions = loader._read_motion(motion_path)
    if rotations.ndim != 3 or rotations.shape[0] == 0:
        parser.error(f"motion data has an invalid shape: {rotations.shape}")
    features = rotations.reshape(rotations.shape[0], -1)

    reducer_config = config["reducer"]
    reducer_path = config_dir / reducer_config["artifact"]
    print(f"Reducing {len(features)} frames with {reducer_config['type']}...")
    if reducer_config["type"] == "PCAReducer":
        with reducer_path.open("rb") as reducer_file:
            reducer = pickle.load(reducer_file)
        reduced_features = reducer.transform(features)
    elif reducer_config["type"] == "AutoEncoderReducer":
        from tensorflow.keras.models import Model, load_model

        autoencoder = load_model(reducer_path, compile=False)
        encoder = Model(
            inputs=autoencoder.input,
            outputs=autoencoder.get_layer("bottleneck").output,
        )
        reduced_features = encoder.predict(features, verbose=0)
    else:
        parser.error(f"unsupported reducer type: {reducer_config['type']}")

    clusterer_config = config["clusterer"]
    clusterer_path = config_dir / clusterer_config["artifact"]
    print(f"Predicting clusters with {clusterer_config['type']}...")
    with clusterer_path.open("rb") as clusterer_file:
        clusterer = pickle.load(clusterer_file)
    cluster_ids = clusterer.predict(reduced_features)
    relevant_cluster_id_label = config["evaluator"]["relevant_cluster_id_label"]
    relevant_cluster_ids = {int(cluster_id) for cluster_id in relevant_cluster_id_label}

    # Keep ranges only for clusters that have an evaluator-approved label.
    category_names = ("CAT_BACK", "CAT_ARMS", "CAT_LEGS")
    proposals = []
    start_frame = 0
    current_cluster = int(cluster_ids[0])
    for frame_index in range(1, len(cluster_ids) + 1):
        if frame_index == len(cluster_ids) or int(cluster_ids[frame_index]) != current_cluster:
            if current_cluster in relevant_cluster_ids:
                feature_ids = [
                    int(feature_id)
                    for feature_id in relevant_cluster_id_label[str(current_cluster)].split("_")
                ]
                if len(feature_ids) != len(category_names):
                    parser.error(
                        f"cluster {current_cluster} label must contain "
                        f"{len(category_names)} feature IDs"
                    )
                proposals.append(
                    {
                        "ergo_method": "OWAS",
                        "start_frame": start_frame,
                        "end_frame": frame_index - 1,
                        "generated": True,
                        "categories": [
                            {"category": name, "feature_id": [feature_id]}
                            for name, feature_id in zip(category_names, feature_ids)
                        ],
                    }
                )
            if frame_index < len(cluster_ids):
                start_frame = frame_index
                current_cluster = int(cluster_ids[frame_index])

    labels = source_labels.setdefault("labels", [])
    manual_labels = [label for label in labels if not label.get("generated", False)]
    replaced_generated_count = len(labels) - len(manual_labels)
    source_labels["labels"] = manual_labels + proposals

    print(f"Updating label file: {label_path}")
    with label_path.open("w", encoding="utf-8") as label_file:
        json.dump(source_labels, label_file, ensure_ascii=False, indent=2)
        label_file.write("\n")

    print(f"Predicted clusters for {len(cluster_ids)} frames")
    print(
        f"Wrote {len(proposals)} generated ranges; replaced "
        f"{replaced_generated_count} previous generated labels and preserved "
        f"{len(manual_labels)} manual labels"
    )
    print(f"Saved labels to {label_path}")


