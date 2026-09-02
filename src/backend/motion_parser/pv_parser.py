import json
import numpy as np
from pathlib import Path


class PVParser:
    """Convert Pose Viewer data into the NPY positions and JSON skeleton consumed by the frontend."""

    def __init__(self, file_path: str, descriptor_file: str):
        reader = None #MotionDataReader(file_path, descriptor_file)
        if reader.positions is None:
            raise ValueError("reader.positions is None; the file was not loaded correctly")
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
            raise ValueError("self.positions is None; no data matrix has been set")
        a = np.ascontiguousarray(arr)
        np.save(out_path, a)
        print(f"Saved global positions array with shape {arr.shape}")
        print(f"File saved: {out_path}")
