import bvhtoolbox
from backend.motion_parser.bvh_parser import BvhParser
from fastapi import UploadFile, File, APIRouter
from pathlib import Path

router = APIRouter()

@router.post("/upload_bvh_numpy")
async def upload_bvh_numpy(file: UploadFile = File(...)):
    contents = await file.read()
    bvh_data = contents.decode("utf-8")

    json_path = Path("data/json/100style.json")

    BvhParser(bvh_data, json_path)
    return {"message": "Upload erfolgreich"}