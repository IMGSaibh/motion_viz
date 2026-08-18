from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os
from pydantic import BaseModel

router = APIRouter()

class ClusterRequest(BaseModel):
    filename: str

@router.post("/cluster_do")
async def cluster_do_endpoint(request: ClusterRequest):
    """Endpoint to call the print_ok function with the selected motion file"""
    try:
        from backend.autolabel.test import print_ok
        print_ok(request.filename)
        return JSONResponse(content={"status": "success", "message": "print_ok() called"})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)