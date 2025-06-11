from ast import List
from pathlib import Path
from turtle import pos
import bvhtoolbox
import numpy as np
from bvh import Bvh
from pprint import pprint
from bvhtoolbox.bvhtransforms import get_rotation_matrices, get_translations, get_affines
from backend.utils import Utils
import json

class BVHParser_2:
    def __init__(self, bvh_data: str):
        self.bvh_tree = bvhtoolbox.BvhTree(bvh_data)
        self.joint_list = self.bvh_tree.get_joints(end_sites=False)
        self.nframes = self.bvh_tree.nframes
        self.njoints = len(self.joint_list)
        self.npyDataset = np.zeros((self.nframes, self.njoints, 3), dtype=np.float32)
        self.joint_index_map = {j.name: idx for idx, j in enumerate(self.joint_list)}
        self.joint_hierarchy = []
        self.joint_names = [j.name for j in self.joint_list]

    def bvh_to_numpy(self):

        for frame_idx in range(self.nframes):
            joint_world_positions = {}
            joint_world_rotations = {}

            for joint in self.joint_list:
                # The offset information also indicates the length and direction
                # used for drawing the parent segment.
                offset = np.array(self.bvh_tree.joint_offset(joint.name))
                channels = self.bvh_tree.joint_channels(joint.name)
                joint_position_channels = []
                joint_rotation_channels = []

                if len(channels) == 6:
                    joint_position_channels = self.bvh_tree.joint_channels(joint.name)[:3]
                    joint_rotation_channels = self.bvh_tree.joint_channels(joint.name)[-3:]

                else:
                    joint_rotation_channels = self.bvh_tree.joint_channels(joint.name)


                parent = self.bvh_tree.joint_parent(joint.name)
                parent_name = parent.name if parent else None

                # --- Joint Hierarchy
                if parent:
                    self.joint_hierarchy.append([self.joint_index_map[joint.name], self.joint_index_map[parent.name]])


                # --- Initiale Position
                if parent is None:
                    # paretnt: postion and rotation comes from the channel values
                    joint_world_positions[joint.name] = np.array(self.bvh_tree.frame_joint_channels(frame_idx, joint.name, joint_position_channels))
                    rotation_values = self.bvh_tree.frame_joint_channels(frame_idx, joint.name, joint_rotation_channels)
                    rotation_order_str = ''.join(first_char[0].upper() for first_char in joint_rotation_channels)
                    joint_world_rotations[joint.name] = Utils.rotation_matrix_xyz(*rotation_values, order=rotation_order_str)
                else:
                    # child: position is clalculated from parent + FK
                    parent_pos = joint_world_positions[parent_name]
                    parent_rot = joint_world_rotations[parent_name]

                    rotation_values = self.bvh_tree.frame_joint_channels(frame_idx, joint.name, joint_rotation_channels)
                    rotation_order_str = ''.join(first_char[0].upper() for first_char in joint_rotation_channels)
                    local_rot = Utils.rotation_matrix_xyz(*rotation_values, order=rotation_order_str)

                    joint_world_rotations[joint.name] = parent_rot @ local_rot
                    joint_world_positions[joint.name] = parent_pos + parent_rot @ offset

                self.npyDataset[frame_idx, self.joint_index_map[joint.name]] = joint_world_positions[joint.name]

        return self.npyDataset
    
    def export_skeleton(self, output_path: Path):
        skeleton = {
            "joints": self.joint_names,
            "hierarchy": self.joint_hierarchy
        }

        with open(output_path, "w") as f:
            json.dump(skeleton, f, indent=2)




