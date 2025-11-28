from fastapi import APIRouter, UploadFile, File
from pathlib import Path
from typing import List


router = APIRouter()

@router.post("/upload")
async def upload(files: List[UploadFile] = File(...)):
    target_dirs = {
        ".bvh": Path("data/bvh"),
        ".csv": Path("data/csv"),
        ".fbx": Path("data/fbx"),
        ".json": Path("data/json"),
        ".mvnx": Path("data/mvnx"),
        ".pkl": Path("data/pkl"),
        ".csv": Path("data/csv"),
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

    saved = len(files) - len(not_saved_files)
    return {
        "message": saved or "",
        "warning": ", ".join(not_saved_files)  or ""
    }