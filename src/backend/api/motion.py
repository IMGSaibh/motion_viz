# from fileinput import filename
# from turtle import up

import numpy as np
from backend.motion_parser import bvh_parser_2, csv_parser
from backend.motion_parser.bvh_parser import BvhParser
from fastapi import UploadFile, File, APIRouter
from pathlib import Path
from backend.motion_parser.bvh_parser_2 import BVHParser_2
from backend.motion_parser.csv_parser import CSVParser

router = APIRouter()
workspacefolder = Path.cwd()

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

    bvhParser = BVHParser_2(bvh_data)

    dataset = bvhParser.bvh_to_numpy()
    savePath_npy = Path(f"data/numpy/{filenameNoEnding}")
    np.save(savePath_npy, dataset)

    # vs code workspacefolder
    bvh_skeleton_path = Path.joinpath(workspacefolder, f"data/json/{filenameNoEnding}_skeleton.json")
    bvhParser.export_skeleton(bvh_skeleton_path)
    
    return {
        "message": "Upload erfolgreich",
        "filename": uploaded_filename,
    }


@router.post("/process_csv2numpy")
async def process_csv2numpy():
    workspacefolder = Path.cwd()
    csv_path = Path.joinpath(workspacefolder, "data/csv/test.csv")
    csvParser = CSVParser(csv_path)
    dataset = csvParser.csv_to_numpy()
    savePath_npy =Path.joinpath(workspacefolder, f"data/numpy/{csv_path.stem}")
    np.save(savePath_npy, dataset)
    csvParser.export_skeleton(Path.joinpath(workspacefolder, f"data/json/{csv_path.stem}_skeleton.json"))