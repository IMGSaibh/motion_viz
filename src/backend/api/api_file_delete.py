from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
from typing import List

router = APIRouter()

ALLOWED_TARGET_DIRS = {
    ".bvh": Path("data/bvh"),
    ".csv": Path("data/csv"),
    ".fbx": Path("data/fbx"),
    ".json": Path("data/json"),
    ".mvnx": Path("data/mvnx"),
    ".npy": Path("data/npy"),
}

class DeleteFilesRequest(BaseModel):
    filenames: List[str]

@router.post("/delete")
async def delete_files(payload: DeleteFilesRequest):
    deleted: List[str] = []
    not_deleted: List[str] = []

    for raw_name in payload.filenames:
        # sanitize (no path traversal)
        safe_name = Path(raw_name).name
        suffix = Path(safe_name).suffix.lower()

        target_dir = ALLOWED_TARGET_DIRS.get(suffix)
        if not target_dir:
            not_deleted.append(safe_name)
            continue

        target_path = target_dir / safe_name

        if target_path.exists() and target_path.is_file():
            target_path.unlink()
            deleted.append(safe_name)
        else:
            not_deleted.append(safe_name)

    return {
        "message": len(deleted) or "",
        "warning": ", ".join(not_deleted) or ""
    }
