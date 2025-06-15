import numpy as np
from typing import List
from pathlib import Path
from fastapi import UploadFile, File, APIRouter
from backend.motion_parser.csv_parser import CSVParser
from backend.motion_parser.bvh_parser import BVHParser

router = APIRouter()
workspacefolder = Path.cwd()

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
        ext = Path(str(file.filename)).suffix.lower()
        target_dir = target_dirs.get(ext)

        if not target_dir:
            # file type not supported
            not_saved_files.append(file.filename)
            continue

        # rename file if it already exists
        target_path = Path.joinpath(target_dir, str(file.filename))
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


@router.post("/convert_bvh_to_npy")
async def convert_bvh_to_npy():
    workspacefolder = Path.cwd()
    bvh_dir_path = Path.joinpath(workspacefolder, "data/bvh/")
    numpy_groundtruth_dir = Path.joinpath(workspacefolder, "data/numpy_groundtruth")
    numpy_groundtruth_dir.mkdir(parents=True, exist_ok=True)
    bvh_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")

    bvh_files = list(bvh_dir_path.glob("*.bvh"))

    if not bvh_files:
        return {
            "warning": "Found no .bvh-Files.",
            "message": "",
        }

    for bvh_file in bvh_files:
        with open(bvh_file, "r") as file:
            bvh_data = file.read()

        bvh_parser = BVHParser(bvh_data)

        dataset = bvh_parser.bvh_to_numpy()
        save_npy_path = Path.joinpath(numpy_groundtruth_dir, f"{bvh_file.name[:-4]}")  # Remove .bvh extension
        np.save(save_npy_path, dataset)


        save_json_skeleton_path = Path.joinpath(bvh_json_skeleton_dir, f"{bvh_file.name[:-4]}_skeleton_groundtruth.json")
        bvh_parser.export_skeleton_groundtruth(save_json_skeleton_path)

    return {
        "message": ".bvh-files converted",
        "warning": "",
    }


@router.post("/convert_csv_to_npy")
async def convert_csv_to_npy():

    workspacefolder = Path.cwd()
    csv_dir_path = Path.joinpath(workspacefolder, "data/csv/")
    numpy_groundtruth_dir = Path.joinpath(workspacefolder, "data/numpy_groundtruth")
    numpy_groundtruth_dir.mkdir(parents=True, exist_ok=True)
    csv_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")


    csv_files = list(csv_dir_path.glob("*.csv"))

    if not csv_files:
        return {
            "warning": "Found no .csv-Files.",
            "message": "",
        }

    for csv_file in csv_files:
        csv_parser = CSVParser(csv_file)
        dataset = csv_parser.csv_to_numpy()

        save_npy_path =Path.joinpath(numpy_groundtruth_dir, f"{csv_file.name[:-4]}") # Remove .csv extension
        np.save(save_npy_path, dataset)
        # TODO: it is kinect_v1_hierarchy and it needs still ordering correspond to the joints 
        save_json_skeleton_path = Path.joinpath(csv_json_skeleton_dir, f"{csv_file.name[:-4]}_skeleton_groundtruth.json")
        csv_parser.export_skeleton_groundtruth(save_json_skeleton_path)
    
    return {
        "message": ".csv-files converted",
        "warning": "",
    }


@router.post("/list_files")
async def list_motion_files():

    # make sure that directories exists
    bvh_dir = Path.joinpath(workspacefolder, "data/bvh/")
    fbx_dir = Path.joinpath(workspacefolder, "data/fbx/")
    npy_dir = Path.joinpath(workspacefolder, "data/numpy_groundtruth/")

    bvh_dir.mkdir(parents=True, exist_ok=True)
    fbx_dir.mkdir(parents=True, exist_ok=True)
    npy_dir.mkdir(parents=True, exist_ok=True)

    return {
        "bvh": [f.name for f in bvh_dir.glob("*.bvh")],
        "fbx": [f.name for f in fbx_dir.glob("*.fbx")],
        "npy": [f.name for f in npy_dir.glob("*.npy")]
    }
