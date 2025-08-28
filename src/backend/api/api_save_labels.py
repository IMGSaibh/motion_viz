
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request,Query


router = APIRouter()
@router.post("/save_labels")
async def save_labels_to_json( motion_name: str,  request: Request):
    target_path = Path("data/labels")
    print(f"Saving labels for motion: {motion_name} to {target_path}")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    try:
        target_dir = Path("data/labels")
        target_dir.mkdir(parents=True, exist_ok=True)
        file_path = target_dir / f"{motion_name}.json"

        file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

        return {
        "message": "saved json",
        "warning": "",
    }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))