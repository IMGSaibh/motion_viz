from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from typing import List, Optional, Tuple
import numpy as np

router = APIRouter()

# Global state for recording
recording_buffer: List[List[List[float]]] = []
is_recording: bool = False
joint_count: int = 0
src_to_dest_map: dict = {}
virtual_nodes: List[int] = []
total_frames: int = 0
current_frame: int = 0
skeleton_json: Optional[dict] = None
file_name: str
target_format: str

class SetupRecordingRequest(BaseModel):
    npy_url: str
    src_dest_map: List[Tuple[int, int]]
    virtual_nodes: List[int]
    target_format: str

@router.post("/setup_recording")
async def setup_recording(request: SetupRecordingRequest):
    global recording_buffer, is_recording, joint_count, src_to_dest_map, virtual_nodes, total_frames, current_frame, file_name, target_format
    
    try:
        # Log the request for debugging
        print(f"Received request:")
        print(f"  - npy_url: {request.npy_url}")
        print(f"  - src_dest_map length: {len(request.src_dest_map)}")
        print(f"  - virtual_nodes length: {len(request.virtual_nodes)}")
        
        target_format = request.target_format
        # Fetch NPY data
        file_path = Path(request.npy_url)
        file_name = file_path.stem
        if not file_path.exists():
            raise HTTPException(status_code=404, detail=f"NPY file not found: {request.npy_url}")
        npy_data = np.load(file_path, allow_pickle=True)
        
        # Store all data
        recording_buffer = npy_data.tolist()
        src_to_dest_map = dict(request.src_dest_map)  # Convert list of tuples to dict
        virtual_nodes = request.virtual_nodes
        total_frames = len(recording_buffer)
        joint_count = len(recording_buffer[0]) if recording_buffer else 0
        current_frame = 0
        is_recording = True
        
        print(f"Recording setup complete:")
        print(f"  - Total frames: {total_frames}")
        print(f"  - Joint count: {joint_count}")
        print(f"  - Source-to-dest mappings: {len(src_to_dest_map)}")
        print(f"  - Virtual nodes: {len(virtual_nodes)}")
        
        return {
            "message": "Recording setup complete",
            "joint_count": joint_count,
            "total_frames": total_frames,
            "mapped_nodes": len(src_to_dest_map),
            "virtual_nodes": len(virtual_nodes),
            "status": "ready"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in setup_recording: {type(e).__name__}: {e}")
        # Clean up on error
        recording_buffer = []
        is_recording = False
        joint_count = 0
        src_to_dest_map = {}
        virtual_nodes = []
        total_frames = 0
        current_frame = 0
        
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/record")
async def record():
    global recording_buffer, is_recording, current_frame, total_frames, joint_count, src_to_dest_map, virtual_nodes, file_name
    
    if not is_recording:
        raise HTTPException(status_code=400, detail="Recording not set up. Call /setup_recording first.")
    
    if current_frame >= total_frames:
        raise HTTPException(status_code=400, detail="Recording complete. All frames have been processed.")
    
    # Limit to first 300 frames for debugging
    max_frames = min(300, total_frames)
    
    # Process all frames up to max_frames
    while current_frame < max_frames:
        # Get the current frame data from source
        source_frame = recording_buffer[current_frame]
        
        # Create destination frame initialized with zeros
        dest_frame = [[0.0, 0.0, 0.0] for _ in range(joint_count)]
        
        # Step 1: Apply direct mappings (src -> dest)
        for src_id, dest_id in src_to_dest_map.items():
            if src_id < len(source_frame) and dest_id < len(dest_frame):
                dest_frame[dest_id] = source_frame[src_id].copy()
        
        # Step 2: Handle virtual nodes (linearly interpolate between neighbors)
        if virtual_nodes:
            # Get all mapped destination IDs
            mapped_ids = sorted(src_to_dest_map.values())
            all_nodes = sorted(mapped_ids + virtual_nodes)
            
            for virtual_id in virtual_nodes:
                virtual_index = all_nodes.index(virtual_id)
                
                # Find nearest mapped nodes before and after
                left_mapped = None
                right_mapped = None
                
                for i in range(virtual_index - 1, -1, -1):
                    if all_nodes[i] in mapped_ids:
                        left_mapped = all_nodes[i]
                        break
                
                for i in range(virtual_index + 1, len(all_nodes)):
                    if all_nodes[i] in mapped_ids:
                        right_mapped = all_nodes[i]
                        break
                
                if left_mapped is not None and right_mapped is not None:
                    # Find source IDs for these destination IDs
                    left_src_id = None
                    right_src_id = None
                    for src_id, dest_id in src_to_dest_map.items():
                        if dest_id == left_mapped:
                            left_src_id = src_id
                        if dest_id == right_mapped:
                            right_src_id = src_id
                    
                    if left_src_id is not None and right_src_id is not None:
                        left_pos = source_frame[left_src_id]
                        right_pos = source_frame[right_src_id]
                        
                        left_idx = all_nodes.index(left_mapped)
                        right_idx = all_nodes.index(right_mapped)
                        virtual_idx = all_nodes.index(virtual_id)
                        
                        t = (virtual_idx - left_idx) / (right_idx - left_idx)
                        
                        dest_frame[virtual_id] = [
                            left_pos[0] + t * (right_pos[0] - left_pos[0]),
                            left_pos[1] + t * (right_pos[1] - left_pos[1]),
                            left_pos[2] + t * (right_pos[2] - left_pos[2])
                        ]
        
        # Replace the source frame with the transformed destination frame
        recording_buffer[current_frame] = dest_frame
        
        # Increment frame counter
        current_frame += 1
    
    # Save to NPY file
    try:    
        # Only save the frames that were processed (first max_frames frames)
        recorded_array = np.array(recording_buffer[:max_frames])
        
        # e.g. file_name is "a_test" and target format is "xsens"
        filepath = Path("data/npy") / f"{file_name}_{target_format}.npy"
        
        # Ensure directory exists
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save to file
        np.save(filepath, recorded_array)
        
        print(f"Recording saved to: {filepath}")
        print(f"  - Frames: {len(recorded_array)}")
        print(f"  - Joints: {recorded_array.shape[1] if len(recorded_array.shape) > 1 else 0}")
        
    except Exception as e:
        print(f"Error saving recording: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save recording: {str(e)}")
    
    # Check if recording is complete
    is_complete = current_frame >= total_frames
    
    return {
        "message": "Recording complete",
        "frames_recorded": max_frames,
        "total_frames": total_frames,
        "is_complete": is_complete,
        "saved_to": str(filepath)
    }