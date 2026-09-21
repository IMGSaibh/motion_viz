import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Response

router = APIRouter()
workspacefolder = Path.cwd()

@router.get("/list_files")
async def list_motion_files(response: Response):
    orignals_dir_path = Path.joinpath(workspacefolder, "data/originals/")
    npy_dir_path = Path.joinpath(workspacefolder, "data/npy/")
    result = {
        "bvh": sorted("data/originals/" + f.name for f in orignals_dir_path.glob("*.bvh")),
        "fbx": sorted("data/originals/" + f.name for f in orignals_dir_path.glob("*.fbx")),
        "npy": sorted("data/npy/" + f.name for f in npy_dir_path.glob("*.npy")),
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
