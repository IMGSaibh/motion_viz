from pathlib import Path
import numpy as np
from pymotion.io.bvh import BVH
from pymotion.ops.skeleton import fk
from mocap_loader import MotionDataReader

class PVParser:
    def __init__(self, file_path: str, descriptor_file: Path):
        
        reader = MotionDataReader(file_path, descriptor_file)
        if reader.positions is None:
            raise ValueError("reader.positions ist None – Datei wurde nicht korrekt geladen")
        self.positions = reader.positions * 100 # Convert from centimeters to meters
        self.r_hierarchy = reader.generateJointHierarchyArray()
        self.joint_names = reader.generateNameList()
        self.joint_graph = reader.joint_graph

    def save_npy(self, out_path: str):
        arr = self.positions
        if arr is None:
            raise ValueError("self.positions ist None – es wurde keine Datenmatrix gesetzt.")
        a = np.ascontiguousarray(arr)
        np.save(out_path, a)
        print(f"Saved global positions array with shape {arr.shape} to {out_path}.npy")
