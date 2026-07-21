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
    print(f"Rest pose request received for: {filePath}")
    
    try:
        file_path = Path(filePath)
        
        if not file_path.exists():
            return Response(
                content=json.dumps({"error": "File not found"}),
                status_code=404,
                media_type="application/json"
            )
        
        # Check file extension
        file_extension = file_path.suffix.lower()
        
        rest_pose = None
        
        if file_extension == '.npy':
            # Load numpy array
            data = np.load(file_path, allow_pickle=True)
            
            print(f"Data shape: {data.shape}")
            print(f"Data dimensions: {data.ndim}")
            
            # Handle 3D data: (frames, joints, 3)
            if data.ndim == 3:
                rest_pose = data[0]  # Shape: (joint_count, 3)
            else:
                return Response(
                    content=json.dumps({"error": f"Expected 3D array, got {data.ndim}D"}),
                    status_code=400,
                    media_type="application/json"
                )
                
        elif file_extension == '.json':
            # Load JSON file
            with open(file_path, 'r') as f:
                json_data = json.load(f)
            
            # Extract rest-pose from JSON
            if 'rest-pose' not in json_data:
                return Response(
                    content=json.dumps({"error": "JSON file does not contain 'rest-pose' field"}),
                    status_code=400,
                    media_type="application/json"
                )
            
            rest_pose = np.array(json_data['rest-pose'])
            print(f"Rest pose shape from JSON: {rest_pose.shape}")
            
        else:
            return Response(
                content=json.dumps({"error": f"Unsupported file type: {file_extension}. Use .npy or .json"}),
                status_code=400,
                media_type="application/json"
            )
        
        # Scale the model to exactly 100 units high
        scaled_rest_pose = scale_to_height(rest_pose, target_height=100.0)
        
        return {
            "restPose": scaled_rest_pose.tolist()
        }
        
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return Response(
            content=json.dumps({"error": f"Invalid JSON file: {str(e)}"}),
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

def scale_to_height(rest_pose: np.ndarray, target_height: float = 100.0) -> np.ndarray:
    # Center the model
    rest_pose[:, 0] -= np.mean(rest_pose[:, 0])  # Center X
    rest_pose[:, 1] -= np.mean(rest_pose[:, 1])  # Center Y
    rest_pose[:, 2] -= np.mean(rest_pose[:, 2])  # Center Z
    
    # Calculate height
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