import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()

class LabelItem(BaseModel):
    startframe: int = Field(..., ge=0)
    endframe: int = Field(..., ge=0)

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

    # optional: make sure start <= end frame
    labels = []
    for item in payload.labels:
        a, b = sorted((item.startframe, item.endframe))
        labels.append({"startframe": a, "endframe": b})

    target_dir = Path("data/labels")
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / f"{Path(payload.motion_name).stem}.json"

    # only label list
    file_path.write_text(json.dumps(labels, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "message": "saved labels", 
        "warning": "",
    }
