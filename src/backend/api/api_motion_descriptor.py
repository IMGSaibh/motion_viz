from pathlib import Path
from fastapi import APIRouter
from backend.json_schema.JsonSchema import JSONGenerator, MotionConfig

router = APIRouter()
workspacefolder = Path.cwd()

@router.post("/motion_descriptor")
async def create_motion_config(config: MotionConfig):
    generator = JSONGenerator()
    data_schema = generator.load_schema(Path.joinpath(workspacefolder, "data/shemes/data_schema.json"))
    generator.from_config(config)

    if config is None:  
        return {
            "warning": "could not create config file",
            "message": "",
        }
    
    generator.save(Path.joinpath(workspacefolder, "data/shemes/new_schema.json"))

    return {
        "message": "config file created",
        "warning": "",
    }