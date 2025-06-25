import re
import json
import numpy as np
import pandas as pd
from pathlib import Path

class SegmentCSVParser:
    def __init__(self, file_path):
        self.file_path = file_path
        self.dataframe = pd.read_csv(file_path)
        self.segment_names = self._extract_segment_names()
        self.nframes = self.dataframe.shape[0]

    def _extract_segment_names(self):
        # identify all columns with "_TX"
        tx_columns = [col for col in self.dataframe.columns if col.endswith("_TX")]
        # remove "_TX" at the end to extract sgement name
        segment_names = [re.sub(r"_TX$", "", col) for col in tx_columns]
        return sorted(set(segment_names))

    def csv_segmentbased_to_numpy(self) -> np.ndarray:
        """
        Gibt ein NumPy-Array mit Shape [nframes, nsegments, 3] zurück.
        Je 3 Werte: [TX, TY, TZ] in Metern
        """
        nsegments = len(self.segment_names)
        dataset = np.zeros((self.nframes, nsegments, 3), dtype=np.float32)

        for i, segment in enumerate(self.segment_names):
            try:
                tx = self.dataframe[f"{segment}_TX"].to_numpy()
                ty = self.dataframe[f"{segment}_TY"].to_numpy()
                tz = self.dataframe[f"{segment}_TZ"].to_numpy()
            except KeyError:
                print(f"Warnung: Segment '{segment}' hat unvollständige Positionsdaten.")
                continue

            dataset[:, i, :] = np.stack([tx, ty, tz], axis=-1)

        # mm → m
        dataset /= 1000.0
        return dataset


    def export_skeleton_converted(self, output_path: Path):
        SEGMENT_BASED_HIERARCHY = [
            ("root", "R femur"),
            ("root", "L femur"),
            ("root", "lower back"),
            ("lower back", "R collar"),
            ("R collar", "head"),
            ("head", "head end"),

            ("R collar", "R humerus"),
            ("R humerus", "R elbow"),
            ("R elbow", "R wrist"),
            ("R wrist", "R wrist end"),

            ("L collar", "L humerus"),
            ("L humerus", "L elbow"),
            ("L elbow", "L wrist"),
            ("L wrist", "L wrist end"),

            ("L femur", "L tibia"),
            ("L tibia", "L foot"),
            ("L foot", "L toe"),

            ("R femur", "R tibia"),
            ("R tibia", "R foot"),
            ("R foot", "R toe"),
        ]

        valid_hierarchy = [
            (a, b) for a, b in SEGMENT_BASED_HIERARCHY
            if a in self.segment_names and b in self.segment_names
        ]

        skeleton_data = {
            "joints": self.segment_names,
            "hierarchy": valid_hierarchy
        }

        with open(output_path, "w") as f:
            json.dump(skeleton_data, f, indent=2)

