from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()
workspacefolder = Path.cwd()


class TrainingRequest(BaseModel):
    motion_files: list[str] = Field(min_length=1)


# @router.post("/start_training")
def start_training(request: TrainingRequest):
    pass
    # try:
    #     from backend.autolabel.al_label_load import load_training_files
    # except ModuleNotFoundError as error:
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"Training dependency is not installed: {error.name}",
    #     ) from error

    # npy_root = (workspacefolder / "data" / "npy").resolve()
    # selected_files: list[Path] = []

    # for supplied_path in request.motion_files:
    #     candidate = (workspacefolder / supplied_path).resolve()
    #     if candidate.parent != npy_root or candidate.suffix.lower() != ".npy":
    #         raise HTTPException(status_code=400, detail=f"Invalid NPY path: {supplied_path}")
    #     if not candidate.is_file():
    #         raise HTTPException(status_code=404, detail=f"NPY file not found: {supplied_path}")
    #     selected_files.append(candidate)

    # try:
    #     sample_count = load_training_files(selected_files)
    # except (FileNotFoundError, ValueError, IndexError) as error:
    #     raise HTTPException(status_code=400, detail=str(error)) from error
    # except OSError as error:
    #     raise HTTPException(status_code=500, detail="Could not load training data") from error

    # return {
    #     "message": f"Training data loaded from {len(selected_files)} file(s).",
    #     "warning": "",
    #     "sample_count": sample_count,
    # }
