from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.motion_parser.pv_parser import PVParser

router = APIRouter()
workspacefolder = Path.cwd()

class ConversionRequest(BaseModel):
    file_name: str

@router.post("/convert_pv_style")
async def convert_pv_style(request: ConversionRequest):
    workspacefolder = Path.cwd()
    
    # Define directories for different file types
    mvnx_dir_path = Path.joinpath(workspacefolder, "data/mvnx/")
    bvh_dir_path = Path.joinpath(workspacefolder, "data/bvh/")
    csv_dir_path = Path.joinpath(workspacefolder, "data/csv/")
    npy_dir_path = Path.joinpath(workspacefolder, "data/npy")
    json_dir = Path.joinpath(workspacefolder, "data/json")

    # Create directories if they don't exist
    mvnx_dir_path.mkdir(parents=True, exist_ok=True)
    bvh_dir_path.mkdir(parents=True, exist_ok=True)
    csv_dir_path.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)
    npy_dir_path.mkdir(parents=True, exist_ok=True)
    
    file_name = request.file_name
    file_path = None
    
    # Determine which directory to search based on file extension
    if file_name.endswith('.mvnx'):
        file_path = Path.joinpath(mvnx_dir_path, file_name)
        descriptor_file = "xsens_mvnx"  # Default descriptor for mvnx files
    elif file_name.endswith('.bvh'):
        file_path = Path.joinpath(bvh_dir_path, file_name)
        descriptor_file = "bvh_pos_100"  # Default descriptor for bvh files
    elif file_name.endswith('.csv'):
        file_path = Path.joinpath(csv_dir_path, file_name)
        descriptor_file = "lara_csv"  # Default descriptor for csv files
    else:
        return {
            "message": "",
            "warning": f"Unsupported file type: {file_name}. Only .mvnx, .bvh, and .csv files are supported.",
        }
    
    # Check if file exists
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {file_name} in {file_path.parent}")
    
    try:
        print(f"Processing: {file_path}")
        print(f"Using descriptor: {descriptor_file}")

        pv_parser = PVParser(str(file_path), descriptor_file)
        save_npy_path = Path.joinpath(npy_dir_path, file_path.stem)  # Remove file extension
        pv_parser.save_npy(str(save_npy_path))
        
        return {
            "message": f"Successfully converted {file_name} to NPY",
            "warning": "",
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")