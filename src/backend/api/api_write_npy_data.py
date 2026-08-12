# UNUSED
# This file is currently not used at all, it is only interesting if we would choose to pursue the mesh retargeting approach

# from fastapi import APIRouter
# from pydantic import BaseModel
# from pathlib import Path
# from typing import List, Optional
# import numpy as np
# from datetime import datetime

# router = APIRouter()

# # Simple global buffer
# recording_buffer: List[List[List[float]]] = []
# is_recording: bool = False
# joint_count: Optional[int] = None

# class FrameData(BaseModel):
#     frame: List[List[float]]  # [joints][xyz]

# @router.get("/start_recording")
# async def start_recording():
#     print("Starting recording of motion data...")
#     global recording_buffer, is_recording, joint_count
#     recording_buffer = []
#     is_recording = True
#     joint_count = None
#     return {"message": "Recording started"}

# #TODO: This should not be written every frame, but instead after all frames are processed
# @router.post("/write_frame")
# async def write_frame(data: FrameData):
#     print(f"Received frame with {len(data.frame)} joints")
#     global recording_buffer, is_recording, joint_count
    
#     if not is_recording:
#         return {"warning": "Not recording. Call start_recording first."}
    
#     # Check joint count consistency
#     current_joint_count = len(data.frame)
#     if joint_count is None:
#         joint_count = current_joint_count
#     elif joint_count != current_joint_count:
#         return {"warning": f"Joint count mismatch: expected {joint_count}, got {current_joint_count}"}
    
#     recording_buffer.append(data.frame)
#     return {"message": f"Frame {len(recording_buffer)} recorded"}

# @router.post("/save_recording")
# async def save_recording():
#     global recording_buffer, is_recording, joint_count
    
#     if not is_recording:
#         return {"warning": "No active recording"}
    
#     if len(recording_buffer) == 0:
#         return {"warning": "No frames to save"}
    
#     # Convert to numpy array
#     npy_array = np.array(recording_buffer, dtype=np.float32)
    
#     # Save to file
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     filename = f"recording_{timestamp}.npy"
#     target_dir = Path("data/npy")
#     target_dir.mkdir(parents=True, exist_ok=True)
#     target_path = target_dir / filename
    
#     np.save(target_path, npy_array)
    
#     # Reset recording state
#     recording_buffer = []
#     is_recording = False
    
#     return {
#         "message": f"Saved {npy_array.shape[0]} frames to {target_path}",
#         "file_path": str(target_path),
#         "shape": list(npy_array.shape)
#     }