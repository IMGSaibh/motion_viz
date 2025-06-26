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
        self._prepare_data()

    def _prepare_data(self):
        workspacefolder = Path.cwd()
        bvh_descriptor_file = Path.joinpath(workspacefolder, "data/descriptor_files/bvh.json")
        config = JsonLoader(bvh_descriptor_file)
        self.bvh.set_scale(config.get("scale"))

        self.local_rots, self.local_pos, self.parents, self.offsets, *_ = self.bvh.get_data()
        # local_pos shape: (frames, joints, 3)
        self.n_frames = self.local_rots.shape[0]



    def compute_global_positions(self) -> np.ndarray:
        # calculate global positions via forward kinematics
        root_pos = self.local_pos[:, 0, :]
        global_positions, _ = fk(self.local_rots, root_pos, self.offsets, self.parents)
        # global_positions shape: (frames, joints, 3)
        return global_positions

    def save_npy(self, out_path: Path):
        arr = self.compute_global_positions()
        np.save(out_path, arr)




    def export_skeleton_converted(self, output_path: Path):
        joint_hierarchy = []

        for joint_idx, parent_idx in enumerate(self.parents):
            if parent_idx != -1:
                joint_hierarchy.append([int(joint_idx), int(parent_idx)])

        skeleton = {
            "joints": list(self.joint_names),
            "hierarchy": joint_hierarchy
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)
