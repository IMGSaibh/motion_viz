# import numpy as np
# from pydantic import BaseModel
# from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter
# from backend.motion_parser.pv_parser import PVParser
# from backend.motion_parser.bvh_parser import BvhParser 
# from backend.json_schema.JsonSchema import JSONGenerator, MotionConfig

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

# TODO: remove cause we use life renderer
# @router.post("/thumbnails")
# async def upload_thumb(request: Request):

#     thumbnails_dir = Path.joinpath(workspacefolder, "data/thumbnails/")
#     thumbnails_dir.mkdir(parents=True, exist_ok=True)

#     filename = request.headers.get("X-File-Name", "thumb.jpg")
#     data = await request.body()
#     (thumbnails_dir / filename).write_bytes(data)
#     return {"ok": True}