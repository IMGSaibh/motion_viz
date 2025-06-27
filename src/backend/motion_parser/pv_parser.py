import json
from pathlib import Path
import numpy as np
from pymotion.io.bvh import BVH
from pymotion.ops.skeleton import fk
import backend.api.pv as pv
import backend.api.pv_utils as pv_utils

class PVParser:
    def __init__(self, file_path: str):
        directory = Path(file_path).parent
        json_desc = directory / "json_descs" / "mvnx.json"

        reader = pv.MotionDataReader(
            file_path, json_desc)

        self.positions = reader.positions * 100
        self.r_hierarchy = reader.generateJointHierarchyArray()

        self.joint_names = reader.generateNameList()

    def save_npy(self, out_path: str):
        arr = self.positions
        np.save(out_path, arr)
        print(f"Saved global positions array with shape {arr.shape} to {out_path}")


    def export_skeleton_groundtruth(self, output_path: Path):
   
        self.joint_hierarchy = []
        for key, item in self.r_hierarchy.items():
            if int(item) < 0 :
                item = 0
            else:
                item = int( item)

            rel = [int(key), item]
            self.joint_hierarchy.append(rel)

        skeleton = {
            "joints": list(self.joint_names),         # sicherstellen, dass es keine np.array ist
            "hierarchy": self.joint_hierarchy              # reine Python-Liste von Listen
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)
