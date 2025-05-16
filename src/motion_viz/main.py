# from fastapi import FastAPI
# from fastapi.responses import HTMLResponse

# app = FastAPI()

# @app.get("/", response_class=HTMLResponse)
# async def index():
#     return """
#     <html>
#         <head>
#             <title>Motion Capture Visualization</title>
#         </head>
#         <body>
#             <h1>Motion Capture Visualization läuft</h1>
#             <p>Hier kommt später die 3D-Visualisierung rein.</p>
#         </body>
#     </html>
#     """
import os
from fastapi import FastAPI
from motion_viz.api import motion
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS erlauben für React-Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(motion.router, prefix="/motion")

# http://localhost:8000/data/bvh/test.bvh
# app.mount("/data", StaticFiles(directory="data"), name="data")

app.mount(
    "/static", 
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "../../data")),
    name="static"
)

@app.get("/")
def read_root():
    return {"message": "Motion Viz Backend läuft!"}