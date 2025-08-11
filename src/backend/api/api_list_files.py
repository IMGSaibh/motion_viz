from pathlib import Path
from fastapi import APIRouter

router = APIRouter()
workspacefolder = Path.cwd()


@router.post("/list_files")
async def list_motion_files():

    # make sure that directories exists
    bvh_dir     = Path.joinpath(workspacefolder, "data/bvh/")
    fbx_dir     = Path.joinpath(workspacefolder, "data/fbx/")
    # mvnx_dir    = Path.joinpath(workspacefolder, "data/mvnx/")
    npy_dir     = Path.joinpath(workspacefolder, "data/npy/")

    bvh_dir.mkdir(parents=True, exist_ok=True)
    fbx_dir.mkdir(parents=True, exist_ok=True)
    npy_dir.mkdir(parents=True, exist_ok=True)

    return {
        "bvh": [f.name for f in bvh_dir.glob("*.bvh")],
        "fbx": [f.name for f in fbx_dir.glob("*.fbx")],
        # "mvnx":[f.name for f in mvnx_dir.glob("*.mvnx")],
        "npy": [f.name for f in npy_dir.glob("*.npy")]
    }