import numpy as np
from typing import List
from pathlib import Path
from fastapi import UploadFile, File, APIRouter, Request
from backend.motion_parser.pv_parser import PVParser
from backend.motion_parser.csv_parser import CSVParser
from backend.motion_parser.bvh_parser import BvhParser 
from backend.motion_parser.csv_c3d_parser import CSV_C3D_Parser
from backend.motion_parser.csv_segmentbased_parser import SegmentCSVParser

router = APIRouter()
workspacefolder = Path.cwd()

@router.post("/uploads")
async def upload(files: List[UploadFile] = File(...)):
    target_dirs = {
        ".bvh": Path("data/bvh"),
        ".csv": Path("data/csv"),
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

@router.post("/convert_pv_style")
async def convert_pv_style():
    workspacefolder = Path.cwd()
    pv_dir_path = Path.joinpath(workspacefolder, "data/pv_style/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/numpy_converted")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    pv_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")

    extensions = ('*.csv', '*.txt', '*.mvnx')

    pv_files = []
    for ext in extensions:
        pv_files.extend(pv_dir_path.glob(ext))  

    pv_files = [f for f in pv_files if f.is_file()]

    if not pv_files:
        return {
            "warning": "Found no pv-compatible files.",
            "message": "",
        }

    for pv_file in pv_files:
        pv_parser = PVParser(pv_file)
        save_npy_path = Path.joinpath(numpy_converted_dir, f"{pv_file.name[:-4]}")  # Remove file extension
        pv_parser.save_npy(save_npy_path)

        save_json_skeleton_path = Path.joinpath(pv_json_skeleton_dir, f"{pv_file.name[:-4]}_skeleton_converted.json")
        pv_parser.export_skeleton_groundtruth(save_json_skeleton_path)

    return {
        "message": "pv-compatible files converted",
        "warning": "",
    }

@router.post("/convert_bvh_to_npy")
async def convert_bvh_to_npy():
    workspacefolder = Path.cwd()
    bvh_dir_path = Path.joinpath(workspacefolder, "data/bvh/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/numpy_converted")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    bvh_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")

    bvh_files = list(bvh_dir_path.glob("*.bvh"))

    if not bvh_files:
        return {
            "warning": "Found no .bvh-Files.",
            "message": "",
        }

    for bvh_file in bvh_files:
        bvh_parser = BvhParser(bvh_file)
        save_npy_path = Path.joinpath(numpy_converted_dir, f"{bvh_file.name[:-4]}")  # Remove .bvh extension
        bvh_parser.save_npy(save_npy_path)

        save_json_skeleton_path = Path.joinpath(bvh_json_skeleton_dir, f"{bvh_file.name[:-4]}_skeleton_converted.json")
        bvh_parser.export_skeleton_converted(save_json_skeleton_path)

    return {
        "message": ".bvh-files converted",
        "warning": "",
    }


@router.post("/convert_csv_kinectv1_to_npy")
async def convert_csv_kinectv1_to_npy():

    workspacefolder = Path.cwd()
    csv_dir_path = Path.joinpath(workspacefolder, "data/csv/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/numpy_converted")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
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

        save_npy_path =Path.joinpath(numpy_converted_dir, f"{csv_file.name[:-4]}") # Remove .csv extension
        np.save(save_npy_path, dataset)

        save_json_skeleton_path = Path.joinpath(csv_json_skeleton_dir, f"{csv_file.name[:-4]}_skeleton_converted.json")
        csv_parser.export_skeleton_converted(save_json_skeleton_path)
    
    return {
        "message": ".csv-files converted",
        "warning": "",
    }


@router.post("/convert_csv_c3d_to_npy")
async def convert_csv_c3d_to_npy():

    workspacefolder = Path.cwd()
    csv_dir_path = Path.joinpath(workspacefolder, "data/csv/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/numpy_converted")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    csv_c3d_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")


    csv_files = list(csv_dir_path.glob("*.csv"))

    if not csv_files:
        return {
            "warning": "Found no .csv-Files.",
            "message": "",
        }

    for csv_file in csv_files:
        csv_parser = CSV_C3D_Parser(csv_file)
        dataset = csv_parser.csv_to_numpy()

        save_npy_path =Path.joinpath(numpy_converted_dir, f"{csv_file.name[:-4]}") # Remove .csv extension
        np.save(save_npy_path, dataset)
        save_json_skeleton_path = Path.joinpath(csv_c3d_json_skeleton_dir, f"{csv_file.name[:-4]}_skeleton_converted.json")
        csv_parser.export_skeleton_converted(save_json_skeleton_path)
    
    return {
        "message": ".csv-files converted",
        "warning": "",
    }


@router.post("/convert_csv_segmentbased_to_npy")
async def convert_csv_segmentbased_to_npy():

    workspacefolder = Path.cwd()
    csv_dir_path = Path.joinpath(workspacefolder, "data/csv/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/numpy_converted")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    csv_c3d_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")


    csv_files = list(csv_dir_path.glob("*.csv"))

    if not csv_files:
        return {
            "warning": "Found no .csv-Files.",
            "message": "",
        }

    for csv_file in csv_files:
        csv_parser = SegmentCSVParser(csv_file)
        dataset = csv_parser.csv_segmentbased_to_numpy()

        save_npy_path =Path.joinpath(numpy_converted_dir, f"{csv_file.name[:-4]}") # Remove .csv extension
        np.save(save_npy_path, dataset)
        save_json_skeleton_path = Path.joinpath(csv_c3d_json_skeleton_dir, f"{csv_file.name[:-4]}_skeleton_converted.json")
        csv_parser.export_skeleton_converted(save_json_skeleton_path)
    
    return {
        "message": ".csv-files converted",
        "warning": "",
    }


@router.post("/list_files")
async def list_motion_files():

    # make sure that directories exists
    bvh_dir = Path.joinpath(workspacefolder, "data/bvh/")
    fbx_dir = Path.joinpath(workspacefolder, "data/fbx/")
    npy_dir = Path.joinpath(workspacefolder, "data/numpy_converted/")

    bvh_dir.mkdir(parents=True, exist_ok=True)
    fbx_dir.mkdir(parents=True, exist_ok=True)
    npy_dir.mkdir(parents=True, exist_ok=True)

    return {
        "bvh": [f.name for f in bvh_dir.glob("*.bvh")],
        "fbx": [f.name for f in fbx_dir.glob("*.fbx")],
        "npy": [f.name for f in npy_dir.glob("*.npy")]
    }

@router.post("/thumbnails")
async def upload_thumb(request: Request):

    thumbnails_dir = Path.joinpath(workspacefolder, "data/thumbnails/")
    thumbnails_dir.mkdir(parents=True, exist_ok=True)

    filename = request.headers.get("X-File-Name", "thumb.jpg")
    data = await request.body()
    (thumbnails_dir / filename).write_bytes(data)
    return {"ok": True}