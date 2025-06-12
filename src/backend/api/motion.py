import numpy as np
from typing import List
from pathlib import Path
from fastapi import UploadFile, File, APIRouter
from backend.motion_parser.csv_parser import CSVParser
# from backend.motion_parser.bvh_parser import BvhParser
from backend.motion_parser import bvh_parser_2, csv_parser
from backend.motion_parser.bvh_parser_2 import BVHParser_2

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


@router.post("/uploads")
async def upload(files: List[UploadFile] = File(...)):
    target_dirs = {
        ".bvh": Path("data/bvh"),
        ".csv": Path("data/csv"),
        ".npy": Path("data/numpy"),
        ".fbx": Path("data/fbx"),
        ".json": Path("data/json"),
    }
    # make sure all target directories exist
    for target in target_dirs.values():
        target.mkdir(parents=True, exist_ok=True)

    not_saved_files = []

    for file in files:
        ext = Path(file.filename).suffix.lower()
        target_dir = target_dirs.get(ext)

        if not target_dir:
            # file type not supported
            not_saved_files.append(file.filename)
            continue

        # rename file if it already exists
        target_path = target_dir / file.filename
        counter = 1
        while target_path.exists():
            target_path = target_dir / f"{target_path.stem}_{counter}{target_path.suffix}"
            counter += 1

        # save file to target directory
        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)

    return {
        "message": f"{len(files) - len(not_saved_files)} files were succesfully uploaded!",
        "not_supported_files": ", ".join(not_saved_files)
    }


@router.post("/convert_bvh_to_numpy")
async def convert_bvh_to_numpy():
    workspacefolder = Path.cwd()
    bvh_path = Path.joinpath(workspacefolder, "data/bvh/test.bvh")

    # TODO: search data/bvh for bvh files and convert them all to numpy
    # TODO: save all numpy files in data/numpy_groundtruth folder
    # TODO: save skeleton in data/Skeleton folder
    # TODO: name all skeleton files like the bvh file, but with _skeleton.json ending

    return {
        "message": "bvh to numpy conversion finshed",
        "path": bvh_path
    }


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
    # TODO: it is kinect_v1_hierarchy and it needs still ordering correspond to the joints 
    csvParser.export_skeleton(Path.joinpath(workspacefolder, f"data/json/{csv_path.stem}_skeleton.json"))


