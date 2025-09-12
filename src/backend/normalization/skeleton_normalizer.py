from pathlib import Path
from typing import Any, Dict
import numpy as np

class SkeletonNormalizer:

    xsens_alias_joints = [
        "Hips", "Chest", "Chest_2", "Chest_3", "Chest_4", "Neck", "Head",
        
        "RightCollar", "RightShoulder", "RightElbow", "RightWrist",
        "LeftCollar", "LeftShoulder", "LeftElbow", "LeftWrist",

        "RightHip", "RightKnee", "RightAnkle", "RightToe",
        "LeftHip", "LeftKnee", "LeftAnkle", "LeftToe",
    ]

    def __init__(self, source_json: Dict[str, Any], source_numpy: np):
        self.workspacefolder = Path.cwd()

        self.json = source_json
        self.numpy = source_numpy
        self.norm_npy = np.zeros




    def load_skeletons(self):
        json_skeleton_norm_dir = Path.joinpath(self.workspacefolder, "data/json_skeleton_norm")
        json_skeleton_norm_dir.mkdir(parents=True, exist_ok=True)
        numpy_converted_norm_dir = Path.joinpath(self.workspacefolder, "data/npy_norm")
        numpy_converted_norm_dir.mkdir(parents=True, exist_ok=True)





    def save_npy(self, out_path: Path):
        np.save(out_path, self.norm_npy)