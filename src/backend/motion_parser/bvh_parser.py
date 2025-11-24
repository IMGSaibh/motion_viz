import json
from pathlib import Path
import numpy as np
from pymotion.io.bvh import BVH
from pymotion.ops.skeleton import fk
from backend.json_loader import JsonLoader



class BvhParser:
    def __init__(self, bvh_path: Path):
        self.bvh = BVH()
        self.bvh.load(str(bvh_path))
        self.joint_names = self.bvh.data["names"]
        self.n_joints = len(self.joint_names)


    def compute_global_positions(self) -> np.ndarray:

        self.local_rots, self.local_pos, self.parents, self.offsets, *_ = self.bvh.get_data()
        # local_pos shape: (frames, joints, 3)
        self.n_frames = self.local_rots.shape[0]

        # calculate global positions via forward kinematics
        root_pos = self.local_pos[:, 0, :]
        global_positions, _ = fk(self.local_rots, root_pos, self.offsets, self.parents)
        # global_positions shape: (frames, joints, 3)
        return global_positions

    def save_npy(self, out_path: Path):
        arr = self.compute_global_positions()
        np.save(out_path, arr)


    def export_skeleton_converted(self, output_path: Path):

        joint_graph = []

        for joint_idx, parent_idx in enumerate(self.parents):
            joint_graph.append({
                "id": int(joint_idx),
                "pid": int(parent_idx),
                "name": self.joint_names[joint_idx]
            })

        skeleton = {
            "systemname": "BVH General",
            "format": "bvh",
            "abbrev": "bvh",
            "positions": "none",
            "rotations": "absolute",
            "rotation-representation": "euler_yxz",
            "fps": 30,
            "offset-type": "relative",
            "dim-order": [0, 1, 2],
            "scale": 0.5,
            "joint-graph": joint_graph
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)


    def scale_data(self, skeleton_path: Path):
        config = JsonLoader(skeleton_path)
        self.bvh.set_scale(config.get("scale"))