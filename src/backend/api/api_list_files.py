from pathlib import Path
from fastapi import APIRouter, Response

router = APIRouter()
workspacefolder = Path.cwd()

@router.get("/list_files")
async def list_motion_files(response: Response):
    base = workspacefolder / "data"
    paths = {"bvh": base / "bvh", "fbx": base / "fbx", "npy": base / "npy", "glb": base / "glb"}

    for p in paths.values():
        p.mkdir(parents=True, exist_ok=True)

    result = {
        "bvh": sorted(f.name for f in paths["bvh"].glob("*.bvh")),
        "fbx": sorted(f.name for f in paths["fbx"].glob("*.fbx")),
        "npy": sorted(f.name for f in paths["npy"].glob("*.npy")),
        "glb": sorted(f.name for f in paths["glb"].glob("*.glb")),
    }

    response.headers["Cache-Control"] = "max-age=30"
    return result
