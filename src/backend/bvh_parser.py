import re
import numpy as np

class BvhParser:
    def __init__(self, filename: str):
        self.filename = filename
        self.joints: list[str] = []         # list of joint names
        self.hierarchy = {}                 # TODO implement Tree/graph hierarchy
        self.frames: list[list[float]] = [] # frames
        self.frame_time = 0.0

    def parse(self):
        with open(self.filename, "r") as f:
            lines = f.readlines()

        hierarchy_started = False
        motion_started = False
        hierarchy_lines: list[str] = []
        motion_lines: list[str] = []

        for line in lines:
            line = line.strip()
            if line == "HIERARCHY":
                hierarchy_started = True
                continue
            if line == "MOTION":
                motion_started = True
                hierarchy_started = False
                continue

            if hierarchy_started:
                hierarchy_lines.append(line)
            elif motion_started:
                motion_lines.append(line)

        self._parse_hierarchy(hierarchy_lines)
        self._parse_motion(motion_lines)

        # Motion-Daten als NumPy Array speichern (Frames x Channels)
        self.frames_np = np.array(self.frames, dtype=np.float32)

    def _parse_hierarchy(self, lines: list[str]) -> None:
        for line in lines:
            if line.startswith("ROOT") or line.startswith("JOINT"):
                parts = line.split()
                if len(parts) > 1:
                    self.joints.append(parts[1])

    def _parse_motion(self, lines: list[str]):
        frames_line: str = lines[0]
        m = re.match(r"Frames:\s+(\d+)", frames_line)
        if not m:
            raise ValueError("Frames-Zeile nicht gefunden")
        frame_count = int(m.group(1))

        frame_time_line = lines[1]
        m = re.match(r"Frame Time:\s+([0-9.]+)", frame_time_line)
        if not m:
            raise ValueError("Frame Time-Zeile nicht gefunden")
        self.frame_time = float(m.group(1))

        self.frames = []
        for frame_line in lines[2:2+frame_count]:
            values = [float(x) for x in frame_line.strip().split()]
            self.frames.append(values)

    def get_joint_names(self):
        return self.joints

    def get_frame_count(self):
        return len(self.frames)

    def get_frame_time(self):
        return self.frame_time
