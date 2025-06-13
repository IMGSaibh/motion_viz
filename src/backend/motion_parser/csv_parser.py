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

    def csv_to_numpy(self) -> np.ndarray:
        dataframe = pd.read_csv(self.file_path)

        coord_cols = [col for col in dataframe.columns if re.match(r'.*[XYZ]$', col)]
        
        # extract joint-namens
        joint_basenames = sorted(set(re.sub(r'[XYZ]$', '', name) for name in coord_cols))
        self.joint_names = joint_basenames
        self.joint_count = len(self.joint_names)
        self.nframes = dataframe.shape[0]

        data = np.zeros((self.nframes, self.joint_count, 3), dtype=np.float32)
        
        for i, joint in enumerate(self.joint_names):
            x = dataframe[f"{joint}X"].to_numpy()
            y = dataframe[f"{joint}Y"].to_numpy()
            z = dataframe[f"{joint}Z"].to_numpy()
            data[:, i, :] = np.stack([x, y, z], axis=-1)

        return data
    
    def export_skeleton_groundtruth(self, output_path: Path):
        # kinect skeleton hierarchy (V1)
        hierarchy = [
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

        # export only joints that are present in the CSV file
        valid_hierarchy = [
            [a, b] for a, b in hierarchy
            if a in self.joint_names and b in self.joint_names
        ]

        skeleton_data = {
            "joints": self.joint_names,
            "hierarchy": valid_hierarchy
        }

        with open(output_path, "w") as f:
            json.dump(skeleton_data, f, indent=2)