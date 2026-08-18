from fastapi import APIRouter
from fastapi.responses import JSONResponse
import os

router = APIRouter()

@router.post("/cluster_do")
async def print_ok():
    """Endpoint to call the print_ok function"""
    # This assumes you have a function in your test.py file
    # that you want to call
    try:
        # Import and call your function

        from backend.autolabel.test import print_ok
        print_ok()
        return JSONResponse(content={"status": "success", "message": "print_ok() called"})
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)