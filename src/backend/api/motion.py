# from fileinput import filename
# from turtle import up

import numpy as np
from backend.motion_parser.bvh_parser import BvhParser
from fastapi import UploadFile, File, APIRouter
from pathlib import Path
from backend.motion_parser.bvh_parser_2 import bvh_to_numpy

router = APIRouter()

# @router.post("/upload_bvh_numpy")
# async def upload_bvh_numpy(file: UploadFile = File(...)):
#     contents = await file.read()
#     bvh_data = contents.decode("utf-8")
#     uploaded_filename = file.filename or "new_motion_file"
#     filenameNoEnding = Path(uploaded_filename).stem
#     json_path = Path("data/json/BentForward_SR.json")

#     bvh_parser = BvhParser(bvh_data, json_path)
#     bvh_parser.load_json_descriptor_file()
#     bvh_parser.bvhtree_to_data()
#     bvh_parser.build_graph()
#     bvh_parser.save_as_numpy(filenameNoEnding)
    
#     return {
#         "message": "Upload erfolgreich",
#         "filename": filenameNoEnding,
#     }

@router.post("/upload_bvh_numpy")
async def upload_bvh_numpy(file: UploadFile = File(...)):
    contents = await file.read()
    bvh_data = contents.decode("utf-8")
    uploaded_filename = file.filename or "new_motion_file"
    filenameNoEnding = Path(uploaded_filename).stem
    
    # json_path = Path("data/json/BentForward_SR.json")

    dataset = bvh_to_numpy(bvh_data)
    savePath_npy = Path(f"data/numpy/{filenameNoEnding}")

    np.save(savePath_npy, dataset)

    
    return {
        "message": "Upload erfolgreich",
        "filename": uploaded_filename,
    }