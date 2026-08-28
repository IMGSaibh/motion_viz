import json
from typing import List
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class LabelImage(BaseModel):
    name: str
    src: str
    category: str

class LabelFeature(BaseModel):
    id: int
    name: str
    image: LabelImage

class LabelCategory(BaseModel):
    id: int
    name: str
    features: List[LabelFeature]

class LabelItem(BaseModel):
    ergo_method: str
    start_frame: int = Field(..., ge=0)
    end_frame: int = Field(..., ge=0)
    categories: List[LabelCategory]

class SaveLabelsRequest(BaseModel):
    motion_name: str          
    labels: List[LabelItem]   

@router.post("/save_labels")
async def save_labels_to_json(payload: SaveLabelsRequest):
    if not payload.labels:
        return {
            "message": "", 
            "warning": "file could not be saved",
        }

    labels = []
    for item in payload.labels:
        a, b = sorted((item.start_frame, item.end_frame))
        labels.append({
            "ergo_method": item.ergo_method,
            "start_frame": a,
            "end_frame": b,
            "categories": [category.model_dump() for category in item.categories],
        })

    target_dir = Path("data/labels")
    target_dir.mkdir(parents=True, exist_ok=True)
    label_json_file_path = target_dir / f"{Path(payload.motion_name).stem}.json"

    mocap_file_ending = Path(payload.motion_name).suffix
    path_to_mocap_file = f"data/{mocap_file_ending[1:]}/{payload.motion_name}"

    label_file = {
        "file_path": path_to_mocap_file,
        "annotator": "not implemented yet",
        "filename": payload.motion_name,
        "labels": labels
    }


    label_json_file_path.write_text(json.dumps(label_file, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "message": "saved labels to " + str(label_json_file_path.resolve()), 
        "warning": "",
    }
