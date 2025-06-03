import numpy as np
import math
from bvh import Bvh


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
    joint_names = [j.name for j in joint_list]
    joint_index_map = {j.name: idx for idx, j in enumerate(joint_list)}

    nframes = bvh.nframes
    njoints = len(joint_list)

    output = np.zeros((nframes, njoints, 3), dtype=np.float32)

    for frame_idx in range(nframes):
        joint_world_pos = {}
        joint_world_rot = {}

        for joint in joint_list:
            name = joint.name
            offset = np.array(bvh.joint_offset(name))

            parent = bvh.joint_parent(name)
            parent_name = parent.name if parent else None

            # --- Initiale Position
            if parent is None:
                # Root: Position kommt aus den ersten drei Channels
                pos = np.array(bvh.frame_joint_channels(frame_idx, name, ["Xposition", "Yposition", "Zposition"]))
                joint_world_pos[name] = pos
                rot_vals = bvh.frame_joint_channels(frame_idx, name, bvh.joint_channels(name)[-3:])
                rot_order = ''.join(c[0].upper() for c in bvh.joint_channels(name)[-3:])
                joint_world_rot[name] = rotation_matrix_xyz(*rot_vals, order=rot_order)
            else:
                # Children: Position ergibt sich aus Parent + FK
                parent_pos = joint_world_pos[parent_name]
                parent_rot = joint_world_rot[parent_name]

                rot_vals = bvh.frame_joint_channels(frame_idx, name, bvh.joint_channels(name))
                rot_order = ''.join(c[0].upper() for c in bvh.joint_channels(name))
                local_rot = rotation_matrix_xyz(*rot_vals, order=rot_order)

                joint_world_rot[name] = parent_rot @ local_rot
                joint_world_pos[name] = parent_pos + parent_rot @ offset

            # Speichern
            output[frame_idx, joint_index_map[name]] = joint_world_pos[name]

    return output, joint_names
