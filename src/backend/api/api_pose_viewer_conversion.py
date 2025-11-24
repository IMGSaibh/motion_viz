from pathlib import Path
from fastapi import APIRouter
from backend.motion_parser.pv_parser import PVParser

router = APIRouter()
workspacefolder = Path.cwd()

@router.post("/convert_pv_style")
async def convert_pv_style():
    workspacefolder = Path.cwd()
    mvnx_dir_path = Path.joinpath(workspacefolder, "data/mvnx/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/npy")
    # json_skeleton_dir = Path.joinpath(workspacefolder, "data/json_skeleton")
    json_dir = Path.joinpath(workspacefolder, "data/json")


    mvnx_dir_path.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    
    mvnx_files = list(mvnx_dir_path.glob("*.mvnx"))

    if not mvnx_files:
        return {
            "message": "",
            "warning": "no pose viewer compatible files found.",
        }

    for mvnx_file in mvnx_files:
        pv_parser = PVParser(str(mvnx_file))
        save_npy_path = Path.joinpath(numpy_converted_dir, f"{mvnx_file.name[:-4]}")  # Remove file extension
        pv_parser.save_npy(str(save_npy_path))

        save_json_skeleton_path = Path.joinpath(json_skeleton_dir, f"{mvnx_file.name[:-4]}_skeleton.json")
        pv_parser.export_skeleton_converted(save_json_skeleton_path)

    return {
        "message": "pose viewer compatible files converted",
        "warning": "",
    }
