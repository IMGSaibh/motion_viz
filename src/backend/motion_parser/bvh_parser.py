import json
from pathlib import Path
import numpy as np
from pymotion.io.bvh import BVH
from pymotion.ops.skeleton import fk

class BvhParser:
    def __init__(self, bvh_path: str):
        self.bvh = BVH()
        self.bvh.load(bvh_path)
        self.joint_names = self.bvh.data["names"]
        self.n_joints = len(self.joint_names)
        self._prepare_data()

    def _prepare_data(self):
        self.local_rots, self.local_pos, self.parents, self.offsets, *_ = self.bvh.get_data()
        # local_pos shape: (frames, joints, 3)
        self.n_frames = self.local_rots.shape[0]

    def compute_global_positions(self) -> np.ndarray:
        # calculate global positions via forward kinematics
        root_pos = self.local_pos[:, 0, :]
        global_positions, _ = fk(self.local_rots, root_pos, self.offsets, self.parents)
        # global_positions shape: (frames, joints, 3)
        return global_positions

    def save_npy(self, out_path: str):
        arr = self.compute_global_positions()
        np.save(out_path, arr)
        print(f"Saved global positions array with shape {arr.shape} to {out_path}")




    def export_skeleton_groundtruth(self, output_path: Path):
        joint_hierarchy = []

        for joint_idx, parent_idx in enumerate(self.parents):
            if parent_idx != -1:
                joint_hierarchy.append([int(joint_idx), int(parent_idx)])  # wichtig: int

        skeleton = {
            "joints": list(self.joint_names),         # sicherstellen, dass es keine np.array ist
            "hierarchy": joint_hierarchy              # reine Python-Liste von Listen
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)
