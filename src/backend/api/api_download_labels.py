from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pathlib import Path
import io
import zipfile

router = APIRouter()

@router.get("/download_labels")
async def download_labels():
    labels_dir = Path("data/labels")
    print("Labels dir:", labels_dir)
    print("Labels Backend fired:", labels_dir)
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
