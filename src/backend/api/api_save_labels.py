import json
from typing import List
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class LabelItem(BaseModel):
    ergo_method: str 
    start_frame: int = Field(..., ge=0)
    end_frame: int = Field(..., ge=0)
    button_text: str

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
        labels.append({"ergo_method": item.ergo_method,"start_frame": a, "end_frame": b,"button_text": item.button_text,})

    target_dir = Path("data/labels")
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / f"{Path(payload.motion_name).stem}.json"

    label_file = {
        "file_path": "not implemented yet",
        "annotator": "not implemented yet",
        "filename": payload.motion_name,
        "labels": labels
    }
    file_path.write_text(json.dumps(label_file, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "message": "saved labels to " + str(file_path.resolve()), 
        "warning": "",
    }
