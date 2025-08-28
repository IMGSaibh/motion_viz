# api_save_labels.py
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
        raise HTTPException(status_code=422, detail="labels must not be empty")

    # optional: sicherstellen, dass start<=end
    labels = []
    for item in payload.labels:
        a, b = sorted((item.startframe, item.endframe))
        labels.append({"startframe": a, "endframe": b})

    safe_name = Path(payload.motion_name).name  # Pfadteile entfernen
    target_dir = Path("data/labels")
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / f"{safe_name}.json"

    # only label list
    file_path.write_text(json.dumps(labels, ensure_ascii=False, indent=2), encoding="utf-8")

    return {"message": "saved json", "file": str(file_path)}
