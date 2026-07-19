from pathlib import Path
from fastapi import APIRouter, Response, Query
import json
import numpy as np
from pydantic import BaseModel
from typing import List

router = APIRouter()

class KeyFrameTrack(BaseModel):
    name: str
    values: List[float]
    times: List[float]

#returns a keyframe track for each joint in the npy file, meaning an array of times and an array of values for each joint
@router.get("/generate_clip")
async def generate_animation_clip(filePath: str = Query(...)):
    print("Clip generation request received!")
    
    try:
        file_path = Path(filePath)
        
        if not file_path.exists():
            return Response(
                content=json.dumps({"error": "File not found"}),
                status_code=404,
                media_type="application/json"
            )
        
        # Load numpy array
        data = np.load(file_path, allow_pickle=True)
        
        print(f"Data shape: {data.shape}")
        print(f"Data dimensions: {data.ndim}")
        
        # Handle 3D data: (frames, joints, 3)
        if data.ndim == 3:
            frame_count, joint_count, _ = data.shape
            
            keyframe_tracks = []
            fps = 30.0
            time_step = 1.0 / fps
            
            for joint_idx in range(joint_count):
                # Select all frames for this specific joint
                joint_values = data[:, joint_idx, :]  # Shape: (frame_count, 3)
                
                # Flatten to [x1, y1, z1, x2, y2, z2, ...]
                values = joint_values.flatten().tolist()
                
                # Create times: [0, 0, 0, 1/30, 1/30, 1/30, ...]
                times = []
                for frame in range(frame_count):
                    times.extend([frame * time_step])

                trackName = f"{joint_idx}.position"
                
                keyframe_tracks.append(
                    KeyFrameTrack(
                        name=trackName,
                        values=values,
                        times=times
                    )
                )
            
            return {
                "message": "File processed successfully",
                "jointCount": joint_count,
                "frameCount": frame_count,
                "shape": list(data.shape),
                "filePath": str(file_path),
                "keyframeTracks": [track.model_dump() for track in keyframe_tracks]
            }
        else:
            return Response(
                content=json.dumps({"error": f"Expected 2D or 3D array, got {data.ndim}D"}),
                status_code=400,
                media_type="application/json"
            )
        
    except Exception as e:
        print(f"Error processing file: {e}")
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )
    
@router.get("/get_rest_pose")
async def get_rest_pose(filePath: str = Query(...)):
    print("Rest pose request received!")
    
    try:
        file_path = Path(filePath)
        
        if not file_path.exists():
            return Response(
                content=json.dumps({"error": "File not found"}),
                status_code=404,
                media_type="application/json"
            )
        
        # Load numpy array
        data = np.load(file_path, allow_pickle=True)
        
        print(f"Data shape: {data.shape}")
        print(f"Data dimensions: {data.ndim}")
        
        # Handle 3D data: (frames, joints, 3)
        if data.ndim == 3:
            # Assuming the first frame is the rest pose
            rest_pose = data[0]  # Shape: (joint_count, 3)
            
            # Scale the model to exactly 100 units high
            rest_pose = scale_to_height(rest_pose, target_height=100.0)
            
            return {
                "restPose": rest_pose.tolist()
            }
        else:
            return Response(
                content=json.dumps({"error": f"Expected 2D or 3D array, got {data.ndim}D"}),
                status_code=400,
                media_type="application/json"
            )
        
    except Exception as e:
        print(f"Error processing file: {e}")
        return Response(
            content=json.dumps({"error": str(e)}),
            status_code=500,
            media_type="application/json"
        )

def scale_to_height(rest_pose: np.ndarray, target_height: float = 200.0) -> np.ndarray:
    rest_pose[:, 0] -= np.mean(rest_pose[:, 0])  # Center X
    rest_pose[:, 1] -= np.mean(rest_pose[:, 1])  # Center Y
    rest_pose[:, 2] -= np.mean(rest_pose[:, 2])  # Center Z

    min_y = np.min(rest_pose[:, 1])
    max_y = np.max(rest_pose[:, 1])
    current_height = max_y - min_y
    
    if current_height == 0:
        print("Warning: Model height is 0, cannot scale")
        return rest_pose
    
    scale_factor = target_height / current_height
    
    scaled_rest_pose = rest_pose * scale_factor
    
    print(f"Original height: {current_height:.2f} → Scaled height: {target_height:.2f}")
    print(f"Scale factor: {scale_factor:.4f}")
    
    return scaled_rest_pose