import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

router = APIRouter()
workspacefolder = Path.cwd()

@router.get("/list_files")
async def list_motion_files(response: Response):
    base = workspacefolder / "data"
    paths = {"bvh": base / "bvh", "fbx": base / "fbx", "npy": base / "npy"}

    for p in paths.values():
        p.mkdir(parents=True, exist_ok=True)

    result = {
        "bvh": sorted(f.name for f in paths["bvh"].glob("*.bvh")),
        "fbx": sorted(f.name for f in paths["fbx"].glob("*.fbx")),
        "npy": sorted(f.name for f in paths["npy"].glob("*.npy")),
    }

    response.headers["Cache-Control"] = "max-age=30"
    return result

@router.get("/load_labels/{motion_file_name}")
async def load_labels_for_motion_file(motion_file_name: str):
    label_file_name = f"{Path(motion_file_name).stem}.json"
    label_file_path = workspacefolder / "data" / "labels" / label_file_name

    if not label_file_path.is_file():
        return {"labels": []}

    try:
        label_file = json.loads(label_file_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=500, detail=f"Could not read label file: {label_file_name}") from error

    if not isinstance(label_file, dict) or not isinstance(label_file.get("labels"), list):
        raise HTTPException(status_code=500, detail=f"Invalid label file: {label_file_name}")

    return {"labels": label_file["labels"]}
