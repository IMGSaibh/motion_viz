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
        ".npy": Path("data/npy"),
    }
    # make sure all target directories exist
    for target in target_dirs.values():
        target.mkdir(parents=True, exist_ok=True)

    saved_files: list[str] = []
    unsupported_files: list[str] = []
    skipped_existing_files: list[str] = []

    for file in files:
        filename = str(file.filename)
        ext = Path(filename).suffix.lower()
        target_dir = target_dirs.get(ext)

        if not target_dir:
            unsupported_files.append(filename)
            continue

        target_path = target_dir / filename
        if target_path.exists():
            skipped_existing_files.append(filename)
            continue

        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)
        saved_files.append(filename)

    warnings = []
    if skipped_existing_files:
        warnings.append(f"Already uploaded, skipped: {', '.join(skipped_existing_files)}")
    if unsupported_files:
        warnings.append(f"Unsupported file type, skipped: {', '.join(unsupported_files)}")

    return {
        "message": len(saved_files) or "",
        "warning": "; ".join(warnings),
        "saved_files": saved_files,
        "skipped_existing_files": skipped_existing_files,
        "unsupported_files": unsupported_files,
    }
