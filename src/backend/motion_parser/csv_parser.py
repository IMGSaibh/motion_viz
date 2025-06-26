import re
import json
import numpy as np
import pandas as pd
from pathlib import Path

class CSVParser:
    def __init__(self, file_path):
        self.file_path = file_path
        self.joint_count = 0
        self.nframes = 0
        self.joint_names = []
        self.unique_segments = []
        self.dataframe ={}

    def csv_to_numpy(self) -> np.ndarray:
        self.dataframe = pd.read_csv(self.file_path, delimiter=',')

        coord_cols = [col for col in self.dataframe.columns if re.match(r'.*[XYZ]$', col)]
        
        # extract joint-namens
        joint_basenames = sorted(set(re.sub(r'[XYZ]$', '', name) for name in coord_cols))
        self.joint_names = joint_basenames
        self.joint_count = len(self.joint_names)
        self.nframes = self.dataframe.shape[0]

        dataset = np.zeros((self.nframes, self.joint_count, 3), dtype=np.float32)
        
        for i, joint in enumerate(self.joint_names):
            x = self.dataframe[f"{joint}X"].to_numpy()
            y = self.dataframe[f"{joint}Y"].to_numpy()
            z = self.dataframe[f"{joint}Z"].to_numpy()
            dataset[:, i, :] = np.stack([x, y, z], axis=-1)

        return dataset

    def export_skeleton_converted(self, output_path: Path):
        # Kinect-V1-Hierarchie
        KINECT_V1_BASED_HIERARCHY = [
            ("HipCenter", "Spine"),
            ("Spine", "ShoulderCenter"),
            ("ShoulderCenter", "Head"),
            ("ShoulderCenter", "ShoulderLeft"),
            ("ShoulderLeft", "ElbowLeft"),
            ("ElbowLeft", "WristLeft"),
            ("WristLeft", "HandLeft"),
            ("ShoulderCenter", "ShoulderRight"),
            ("ShoulderRight", "ElbowRight"),
            ("ElbowRight", "WristRight"),
            ("WristRight", "HandRight"),
            ("HipCenter", "HipLeft"),
            ("HipLeft", "KneeLeft"),
            ("KneeLeft", "AnkleLeft"),
            ("AnkleLeft", "FootLeft"),
            ("HipCenter", "HipRight"),
            ("HipRight", "KneeRight"),
            ("KneeRight", "AnkleRight"),
            ("AnkleRight", "FootRight")
        ]

        # Mapping: Name → Index
        name_to_idx = {name: idx for idx, name in enumerate(self.joint_names)}

        joint_hierarchy = [
            [name_to_idx[a], name_to_idx[b]]
            for a, b in KINECT_V1_BASED_HIERARCHY
            if a in name_to_idx and b in name_to_idx
        ]

        skeleton = {
            "joints": self.joint_names,
            "hierarchy": joint_hierarchy
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(skeleton, f, indent=2)
