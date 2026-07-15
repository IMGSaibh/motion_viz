from pathlib import Path
from typing import TypedDict
from fastapi import APIRouter
from backend.motion_parser.bvh_parser import BvhParser 

router = APIRouter()


class BvhConversionError(TypedDict):
    file: str
    error_type: str
    message: str


@router.post("/convert_bvh_to_npy")
async def convert_bvh_to_npy():
    workspacefolder = Path.cwd()
    bvh_dir_path = Path.joinpath(workspacefolder, "data/bvh/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/npy")
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    bvh_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")

    bvh_files = list(bvh_dir_path.glob("*.bvh"))

    if not bvh_files:
        return {
            "message": "",
            "warning": "No [.bvh] files found.",
        }
    errors: list[BvhConversionError] = []
    for bvh_file in bvh_files:
        try:
            print(f"processing {bvh_file}")
            print("==========================================================================================================================")
            bvh_parser = BvhParser(bvh_file)
            save_npy_path = Path.joinpath(numpy_converted_dir, f"{bvh_file.name[:-4]}")  # Remove .bvh extension
            bvh_parser.save_npy(save_npy_path)

            save_json_skeleton_path = Path.joinpath(bvh_json_skeleton_dir, f"{bvh_file.name[:-4]}.json")
            bvh_parser.export_skeleton_converted(save_json_skeleton_path)
            bvh_parser.scale_data(save_json_skeleton_path)

        except Exception as e:
            errors.append({
                "file": bvh_file.name,
                "error_type": type(e).__name__,
                "message": str(e),
            })

    return {
        "message": "[.bvh] files converted",
        "warning": "",
        "errors": errors,
    }
