import json
from pathlib import Path
import re
import pandas as pd
import numpy as np

class CSVParser:
    def __init__(self, file_path):
        self.file_path = file_path
        self.joint_count = 0
        self.nframes = 0
        self.joint_names = []

    def csv_to_numpy(self) -> np.ndarray:
        dataframe = pd.read_csv(self.file_path)

        # # Ignoriere nicht-joint-relevante Spalten
        coord_cols = [col for col in dataframe.columns if re.match(r'.*[XYZ]$', col)]
        # self.joint_names = sorted(set(re.sub(r'[XYZ]$', '', name) for name in coord_cols))
        self.joint_names = [name for name in coord_cols]

        # Sicherheits-Check: Stelle sicher, dass alle Koordinaten vollständig vorhanden sind
        joint_names_filtered = []
        for name in self.joint_names:
            if all(f"{name}{axis}" in coord_cols for axis in ['X', 'Y', 'Z']):
                joint_names_filtered.append(name)

        # self.joint_names = joint_names_filtered
        self.joint_count = len(self.joint_names)
        self.nframes = dataframe.shape[0]

        # NumPy-Array erzeugen
        data = np.zeros((self.nframes, self.joint_count, 3), dtype=np.float32)
        for i, joint in enumerate(self.joint_names):
            x = dataframe[f"{joint}"].values
            y = dataframe[f"{joint}"].values
            z = dataframe[f"{joint}"].values
            data[:, i, :] = np.stack([x, y, z], axis=-1)

        # Optional speichern
        # if save_npy_path:
        #     np.save(save_npy_path, data)
        # if save_jointlist_path:
        #     with open(save_jointlist_path, "w") as f:
        #         json.dump(joint_names, f, indent=2)

        return data
    
    def export_skeleton(self, output_path: Path):
        with open(output_path, "w") as f:
                json.dump(self.joint_names, f, indent=2)