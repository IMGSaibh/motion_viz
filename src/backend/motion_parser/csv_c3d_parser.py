import re
import json
import numpy as np
import pandas as pd
from pathlib import Path

class CSV_C3D_Parser:
    def __init__(self, file_path, unit_scale=1.0 / 1000.0):
        self.file_path = file_path
        self.unit_scale = unit_scale  # standard: mm → m
        self.marker_names = []
        self.nframes = 0
        self.dataframe ={}

    def csv_to_numpy(self) -> np.ndarray:
        with open(self.file_path, 'r') as f:
            lines = f.readlines()

        marker_line = lines[2].strip().split(',')
        coord_line = lines[3].strip().split(',')

        marker_names = []
        index = 2  # Start nach Frame & Sub Frame

        while index + 2 < len(marker_line) and index + 2 < len(coord_line):
            coord_type = coord_line[index].strip()
            if coord_type == 'X':
                name = marker_line[index].strip()
                clean_name = re.sub(r'[^a-zA-Z0-9_:-]', '', name)
                marker_names.append(clean_name)
            index += 3  # weiter zum nächsten Marker

        self.marker_names = marker_names

        # Lese eigentliche Daten
        self.dataframe = pd.read_csv(self.file_path, skiprows=5)
        self.nframes = self.dataframe.shape[0]
        nmarkers = len(marker_names)

        dataset = np.zeros((self.nframes, nmarkers, 3), dtype=np.float32)

        for i in range(nmarkers):
            base_col = 2 + i * 3  # Skip Frame, Sub Frame
            x = self.dataframe.iloc[:, base_col].to_numpy()
            y = self.dataframe.iloc[:, base_col + 1].to_numpy()
            z = self.dataframe.iloc[:, base_col + 2].to_numpy()
            coords = np.stack([x, y, z], axis=-1) * self.unit_scale
            dataset[:, i, :] = coords

        return dataset
    

    def export_skeleton_groundtruth(self, output_path: Path):

        KINECT_V1_HIERARCHY = [
            ("LFHD", "RFHD"),    # Head left–right
            ("LFHD", "LBHD"),    # Head back–front (optional)
            ("RFHD", "RBHD"),

            ("CLAV", "STRN"),    # Clavicle to Sternum
            ("CLAV", "LSHO"),    # Shoulders
            ("CLAV", "RSHO"),

            ("LSHO", "LELB"),    # Left Arm
            ("LELB", "LWRA"),
            ("LWRA", "LWRB"),
            ("LWRB", "LFIN"),

            ("RSHO", "RELB"),    # Right Arm
            ("RELB", "RWRA"),
            ("RWRA", "RWRB"),
            ("RWRB", "RFIN"),

            ("CLAV", "T10"),     # Upper to lower spine

            ("T10", "PELO"),     # Pelvis
            ("PELO", "LASI"),    # Hip region
            ("PELO", "RASI"),
            ("LASI", "LTHI"),    # Left Leg
            ("LTHI", "LKNE"),
            ("LKNE", "LTIB"),
            ("LTIB", "LANK"),
            ("LANK", "LTOE"),

            ("RASI", "RTHI"),    # Right Leg
            ("RTHI", "RKNE"),
            ("RKNE", "RTIB"),
            ("RTIB", "RANK"),
            ("RANK", "RTOE")
        ]


        # export only joints that are present in the CSV file LARa
        valid_hierarchy = [
            (a, b) for (a, b) in KINECT_V1_HIERARCHY
            if a in self.marker_names and b in self.marker_names
        ]

        skeleton_data = {
            "joints": self.marker_names,
            "hierarchy": valid_hierarchy
        }

        with open(output_path, "w") as f:
            json.dump(skeleton_data, f, indent=2)