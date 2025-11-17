import json
from pathlib import Path
import numpy as np
from pymotion.io.bvh import BVH
from pymotion.ops.skeleton import fk
from mocap_loader import MotionDataReader

class PVParser:
    def __init__(self, file_path: str):
        workspacefolder = Path.cwd()
        mvnx_descriptor_file = Path.joinpath(workspacefolder, "data/descriptor_files/mvnx.json")

        reader = MotionDataReader(file_path, mvnx_descriptor_file)

        if reader.positions is None:
            raise ValueError("reader.positions ist None – Datei wurde nicht korrekt geladen")
        self.positions = reader.positions * 100 # Convert to mm
        self.r_hierarchy = reader.generateJointHierarchyArray()

        self.joint_names = reader.generateNameList()

    def save_npy(self, out_path: str):
        arr = self.positions
        if arr is None:
            raise ValueError("self.positions ist None – es wurde keine Datenmatrix gesetzt.")
        a = np.ascontiguousarray(arr)
        np.save(out_path, a)
        print(f"Saved global positions array with shape {arr.shape} to {out_path}")


    def export_skeleton_converted(self, output_path: Path):
   
        self.joint_hierarchy = []
        for key, item in self.r_hierarchy.items():
            if int(item) < 0 :
                item = 0
            else:
                item = int( item)

            rel = [int(key), item]
            self.joint_hierarchy.append(rel)

        skeleton = {
            "joints": list(self.joint_names),         # make sure it is not a np.array
            "hierarchy": self.joint_hierarchy         # pure python liste of listen
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)
