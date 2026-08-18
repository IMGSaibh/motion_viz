from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path
import io
import zipfile
import json

router = APIRouter()

@router.get("/download_labels")
async def download_labels():
    labels_dir = Path("data/labels")
    
    if not labels_dir.exists():
        raise HTTPException(status_code=404, detail="Folder data/labels not found")

    json_files = sorted([p for p in labels_dir.glob("*.json") if p.is_file()])
    if not json_files:
        raise HTTPException(status_code=404, detail="No label json files found in data/labels")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in json_files:
            zf.write(p, arcname=p.name)

    buf.seek(0)

    headers = {"Content-Disposition": 'attachment; filename="labels_export.zip"'}
    return StreamingResponse(buf, media_type="application/zip", headers=headers)

@router.get("/load_labels/{filename}")
async def load_labels(filename: str):
    """Load labels for a specific motion file if available"""
    try:
        # Convert filename to label filename (replace extension with .json)
        base_name = Path(filename).stem  # Remove extension
        label_path = Path("data/labels") / f"{base_name}.json"
        
        if not label_path.exists():
            return {"labels": [], "message": f"No labels found for {filename}"}
        
        with open(label_path, 'r') as f:
            data = json.load(f)
        
        return {
            "labels": data.get("labels", []),
            "file_path": data.get("file_path"),
            "annotator": data.get("annotator"),
            "message": f"Loaded {len(data.get('labels', []))} labels"
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in label file for {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
