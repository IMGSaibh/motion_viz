from fastapi import FastAPI
from backend.api import motion
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

app = FastAPI()

# allow CORS for React-Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(motion.router, prefix="/motion")

# reachable e.g. http://localhost:8000/data/bvh/myFile.bvh
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/src", StaticFiles(directory="src/frontend/public"), name="favicon")

favicon_path = 'src/frontend/public/human.ico'
@app.get('/favicon.ico', include_in_schema=False)
async def favicon() -> FileResponse:
    return FileResponse(favicon_path)

@app.get("/")
def read_root():
    return {"message": "Motion Viz is running!"}