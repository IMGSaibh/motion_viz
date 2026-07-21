from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import json

router = APIRouter()

class SaveFormatRequest(BaseModel):
    filename: str
    data: dict

@router.post("/save_format")
async def save_format(request: SaveFormatRequest):
    try:
        # Ensure filename has .json extension
        if not request.filename.endswith('.json'):
            request.filename += '.json'
        
        # Create file path
        filepath = Path("data/target_format_descriptions") / request.filename
        
        # Ensure directory exists
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to file
        with open(filepath, 'w') as f:
            json.dump(request.data, f, indent=2)
        
        print(f"Format file saved to: {filepath}")
        
        return {
            "message": "Format file saved successfully",
            "filename": request.filename,
            "path": str(filepath)
        }
        
    except Exception as e:
        print(f"Error saving format file: {e}")
        raise HTTPException(status_code=500, detail=str(e))