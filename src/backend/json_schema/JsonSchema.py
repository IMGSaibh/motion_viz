import json
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any
# from jsonschema import validate, ValidationError

class MotionConfig(BaseModel):
    """Describe how tabular motion data maps to the generated motion JSON schema."""

    format: str
    abbrev: Optional[str] = ""
    scale: float = 1
    positions: str = ""
    rotations: str = ""
    systemname: Optional[str] = ""
    fps: int = 30
    jointcount: int = 30
    coloffset: int = 0
    colgap: int = 0
    dimsize: int = 3

class JSONGenerator:
    """Build and persist motion metadata consumed by backend parsers and the frontend.

    Extend this class when generation rules or joint-column mappings change. Request
    validation belongs in API models, while raw motion parsing belongs in the dedicated
    parser modules.
    """

    def __init__(self, schema_path=None):
        self.schema = None
        if schema_path:
            self.schema = self.load_schema(schema_path)
        self.data = {}

    def load_schema(self, file_path):
        with open(file_path, 'r') as file:
            return json.load(file)

    def get_col_inds(self, jointcount, start=0, gap=0, dims=3):
        ret = []
        for i in range(start, jointcount * (dims + gap), dims + gap):
            vec = []
            for d in range(dims):
                vec.append(i + d)
            ret.append(vec)
        return ret

    def create_empty_joint_graph(self, jointcount):
        ret = []
        for i in range(jointcount):
            item = {'id': i, 'name': str(i), 'pid': -1}
            ret.append(item)
        return ret

    def from_config(self, config: MotionConfig):
        # Uses all MotionConfig fields to create the structure
        self.data = {
            "format": config.format,
            "abbrev": config.abbrev,
            "scale": config.scale,
            "positions": config.positions,
            "rotations": config.rotations,
            "systemname": config.systemname,
            "fps": config.fps,
        }

        jc = config.jointcount

        if config.positions != "none":
            self.data['joint-pos-cols'] = self.get_col_inds(jc, config.coloffset, config.colgap, config.dimsize)

        if config.rotations != "none":
            self.data['joint-rot-cols'] = self.get_col_inds(jc, config.coloffset, config.colgap, config.dimsize)

        self.data['joint-graph'] = self.create_empty_joint_graph(jc)

    def save(self, file_path):
        with open(file_path, "w") as json_file:
            json.dump(self.data, json_file, indent=4)

    # def validate_data(self):
    #     if self.schema is not None:
    #         from jsonschema import validate, ValidationError
    #         try:
    #             validate(instance=self.data, schema=self.schema)
    #             print("Validation successful.")
    #         except ValidationError as e:
    #             print(f"Validation error: {e.message}")
    #     else:
    #         print("No schema loaded.")
