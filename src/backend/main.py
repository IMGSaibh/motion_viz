from fastapi import FastAPI
from backend.api import api_list_files
from backend.api import api_file_upload
from backend.api import api_file_delete
from backend.api import api_motion_descriptor
from backend.api import api_pose_viewer_conversion
from backend.api import api_bvh_conversion
from backend.api import api_save_labels
from backend.api import api_download_labels
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()

# allow CORS for React-Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://141.56.132.116:5173", "http://localhost:8000",  "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
    #wichtig für filename aus Header
    # expose_headers=["Content-Disposition"],  
)

@app.get("/")
def read_root():
    return {"message": "Motion Viz is running!"}

favicon_path = 'src/frontend/public/human.ico'
@app.get('/favicon.ico', include_in_schema=False)
async def favicon() -> FileResponse:
    return FileResponse(favicon_path)

# reachable e.g. http://localhost:8000/data/bvh/myFile.bvh
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/src", StaticFiles(directory="src/frontend/public"), name="favicon")

app.include_router(api_list_files.router, prefix="/api_list_files")
app.include_router(api_file_upload.router, prefix="/api_file_upload")
app.include_router(api_file_delete.router, prefix="/api_file_delete")
app.include_router(api_motion_descriptor.router, prefix="/api_motion_descriptor")
app.include_router(api_pose_viewer_conversion.router, prefix="/api_pose_viewer_conversion")
app.include_router(api_bvh_conversion.router, prefix="/api_bvh_conversion")
app.include_router(api_save_labels.router, prefix="/api_save_labels")
app.include_router(api_download_labels.router, prefix="/api_download_labels")



