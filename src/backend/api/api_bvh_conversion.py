from pathlib import Path
from typing import TypedDict
from fastapi import APIRouter
from backend.motion_parser.bvh_parser import BvhParser 

router = APIRouter()


class BvhConversionError(TypedDict):
    file: str
    error_type: str
    message: str


class SkippedBvhConversion(TypedDict):
    file: str
    npy_file: str
    json_file: str


@router.post("/convert_bvh_to_npy")
async def convert_bvh_to_npy():
    workspacefolder = Path.cwd()
    bvh_dir_path = Path.joinpath(workspacefolder, "data/bvh/")
    numpy_converted_dir = Path.joinpath(workspacefolder, "data/npy")
    bvh_json_skeleton_dir = Path.joinpath(workspacefolder, "data/json")
    bvh_dir_path.mkdir(parents=True, exist_ok=True)
    numpy_converted_dir.mkdir(parents=True, exist_ok=True)
    bvh_json_skeleton_dir.mkdir(parents=True, exist_ok=True)

    bvh_files = list(bvh_dir_path.glob("*.bvh"))

    if not bvh_files:
        return {
            "message": "",
            "warning": "No [.bvh] files found.",
        }

    converted_files: list[str] = []
    skipped_files: list[SkippedBvhConversion] = []
    errors: list[BvhConversionError] = []
    for bvh_file in bvh_files:
        save_npy_path = numpy_converted_dir / f"{bvh_file.stem}.npy"
        save_json_skeleton_path = bvh_json_skeleton_dir / f"{bvh_file.stem}.json"

        if save_npy_path.is_file() and save_json_skeleton_path.is_file():
            skipped_files.append({
                "file": bvh_file.name,
                "npy_file": save_npy_path.name,
                "json_file": save_json_skeleton_path.name,
            })
            continue

        try:
            print(f"processing {bvh_file}")
            print("==========================================================================================================================")
            bvh_parser = BvhParser(bvh_file)
            bvh_parser.save_npy(save_npy_path)

            bvh_parser.export_skeleton_converted(save_json_skeleton_path)
            bvh_parser.scale_data(save_json_skeleton_path)
            converted_files.append(bvh_file.name)

        except Exception as e:
            errors.append({
                "file": bvh_file.name,
                "error_type": type(e).__name__,
                "message": str(e),
            })

    return {
        "message": f"{len(converted_files)} [.bvh] files converted, {len(skipped_files)} already converted files skipped",
        "warning": "",
        "converted_files": converted_files,
        "skipped_files": skipped_files,
        "errors": errors,
    }
