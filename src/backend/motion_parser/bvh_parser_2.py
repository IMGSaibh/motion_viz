from ast import List
import math
from pathlib import Path
from turtle import pos
import bvhtoolbox
import numpy as np
from bvh import Bvh
from pprint import pprint
from bvhtoolbox.bvhtransforms import get_rotation_matrices, get_translations, get_affines
#     # vs code workspacefolder
#     workspacefolder = Path.cwd()
#     bvh_path = Path.joinpath(workspacefolder, "data/bvh/BentForward_SR.bvh")

def rotation_matrix_xyz(x, y, z, order):
    rx = np.array([
        [1, 0, 0],
        [0, math.cos(math.radians(x)), -math.sin(math.radians(x))],
        [0, math.sin(math.radians(x)), math.cos(math.radians(x))]
    ])

    ry = np.array([
        [math.cos(math.radians(y)), 0, math.sin(math.radians(y))],
        [0, 1, 0],
        [-math.sin(math.radians(y)), 0, math.cos(math.radians(y))]
    ])

    rz = np.array([
        [math.cos(math.radians(z)), -math.sin(math.radians(z)), 0],
        [math.sin(math.radians(z)), math.cos(math.radians(z)), 0],
        [0, 0, 1]
    ])

    matrices = {"X": rx, "Y": ry, "Z": rz}
    R = np.identity(3)
    for axis in order:
        R = R @ matrices[axis.upper()]
    return R


def bvh_to_numpy(bvh_text: str):
    bvh = Bvh(bvh_text)
    joint_list = bvh.get_joints()
    joint_index_map = {j.name: idx for idx, j in enumerate(joint_list)}

    nframes = bvh.nframes
    njoints = len(joint_list)

    npyDataset = np.zeros((nframes, njoints, 3), dtype=np.float32)

    for frame_idx in range(nframes):
        joint_world_positions = {}
        joint_world_rotations = {}

        for joint in joint_list:
            # The offset information also indicates the length and direction
            # used for drawing the parent segment.
            offset = np.array(bvh.joint_offset(joint.name))

            channels = bvh.joint_channels(joint.name)
            joint_position_channels = []
            joint_rotation_channels = []
            if len(channels) == 6:
                joint_position_channels = bvh.joint_channels(joint.name)[:3]
                joint_rotation_channels = bvh.joint_channels(joint.name)[-3:]

            else:
                joint_rotation_channels = bvh.joint_channels(joint.name)




            parent = bvh.joint_parent(joint.name)
            parent_name = parent.name if parent else None

            # --- Initiale Position
            if parent is None:
                # paretnt: postion and rotation comes from the channel values
                joint_world_positions[joint.name] = np.array(bvh.frame_joint_channels(frame_idx, joint.name, joint_position_channels))
                rotation_values = bvh.frame_joint_channels(frame_idx, joint.name, joint_rotation_channels)
                rotation_order_str = ''.join(first_char[0].upper() for first_char in joint_rotation_channels)
                joint_world_rotations[joint.name] = rotation_matrix_xyz(*rotation_values, order=rotation_order_str)
            else:
                # child: position is clalculated from parent + FK
                parent_pos = joint_world_positions[parent_name]
                parent_rot = joint_world_rotations[parent_name]

                rotation_values = bvh.frame_joint_channels(frame_idx, joint.name, joint_rotation_channels)
                rotation_order_str = ''.join(first_char[0].upper() for first_char in joint_rotation_channels)
                local_rot = rotation_matrix_xyz(*rotation_values, order=rotation_order_str)

                joint_world_rotations[joint.name] = parent_rot @ local_rot
                joint_world_positions[joint.name] = parent_pos + parent_rot @ offset

            # save
            npyDataset[frame_idx, joint_index_map[joint.name]] = joint_world_positions[joint.name]

    return npyDataset



