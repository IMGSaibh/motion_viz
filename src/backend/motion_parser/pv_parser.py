import json
import numpy as np
from pathlib import Path
from mocap_loader import MotionDataReader

class PVParser:
    def __init__(self, file_path: str, descriptor_file: str):
        reader = MotionDataReader(file_path, descriptor_file)
        if reader.positions is None:
            raise ValueError("reader.positions ist None – Datei wurde nicht korrekt geladen")
        self.positions = reader.positions * 100 # Convert from centimeters to meters
        self.r_hierarchy = reader.generateJointHierarchyArray()
        self.joint_names = reader.generateNameList()
        self.joint_graph = reader.joint_graph

        workspacefolder = Path.cwd()
        skeleton = {
            "joint-graph": self.joint_graph
        }
        with open(Path.joinpath(workspacefolder, f"data/json/{Path(file_path).stem}.json"), "w") as f:
            json.dump(skeleton, f, indent=2)

    def save_npy(self, out_path: str):
        pass
        arr = self.positions
        if arr is None:
            raise ValueError("self.positions ist None – es wurde keine Datenmatrix gesetzt.")
        a = np.ascontiguousarray(arr)
        np.save(out_path, a)
        print(f"Saved global positions array with shape {arr.shape}")
        print(f"Datei gespeichert: {out_path}")