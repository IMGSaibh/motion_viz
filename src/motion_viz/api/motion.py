from fastapi import APIRouter, UploadFile, File, HTTPException
from motion_viz.bvh_parser import BvhParser
from tempfile import NamedTemporaryFile

router = APIRouter()

@router.post("/upload_bvh")
async def upload_bvh(file: UploadFile = File(...)):
    if not file.filename.endswith(".bvh"):
        raise HTTPException(status_code=400, detail="Nur .bvh Dateien erlaubt")

    # Temporäre Datei erstellen und Upload speichern
    try:
        with NamedTemporaryFile(delete=True) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp.flush()

            parser = BvhParser(tmp.name)
            parser.parse()

            # Beispiel Antwort
            return {
                "filename": file.filename,
                "joints": parser.get_joint_names(),
                "frame_count": parser.get_frame_count(),
                "frame_time": parser.get_frame_time(),
                "frames_shape": parser.get_frames_np().shape,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"parsing error: {e}")
