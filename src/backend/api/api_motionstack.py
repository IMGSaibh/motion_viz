import json
import warnings
import os
from marshal import load
from pathlib import Path
from posixpath import join
from fastapi import APIRouter
from motionstack.reader import MotionReader
import numpy as np
from pydantic import BaseModel

router = APIRouter()
workspacefolder = Path.cwd()


class MotionstackConversionRequest(BaseModel):
    descriptor_type: str

@router.post("/convert_with_motionstack")
async def convert_with_motionstack(request: MotionstackConversionRequest):
   
    workspacefolder = Path.cwd()
    orignals_dir_path = Path.joinpath(workspacefolder, "data/originals/")
    npy_dir_path = Path.joinpath(workspacefolder, "data/npy")
    npy_dir_path.mkdir(parents=True, exist_ok=True)
    skeleton_dir_path = Path.joinpath(workspacefolder, "data/skeletons")
    skeleton_dir_path.mkdir(parents=True, exist_ok=True)


    # Pairs of descriptor_file and mocap_file
    # ======================================= Work activities =======================================
    file_pairs = []
    mvnx_files = list(orignals_dir_path.glob("*.mvnx"))
    bvh_files = list(orignals_dir_path.glob("*.bvh"))


    if os.listdir(orignals_dir_path) == []:
        return {
            "message": "",
            "warning": "no motion files found in the originals folder.",
        }

    for mfile in mvnx_files:
            file_pairs.append((str(mfile), request.descriptor_type))

    for bfile in bvh_files:
            file_pairs.append((str(bfile), request.descriptor_type))

    print("Start converting files")
    converted_count = 0
    failed_count = 0

    for mocap_file, descriptor_file in file_pairs:
        print(f"processing {mocap_file} with {descriptor_file}")

        try:
            with warnings.catch_warnings(record=True) as reader_warnings:
                warnings.simplefilter("always")
                reader = MotionReader(mocap_file, descriptor_file, axis_flip=True)

            if reader_warnings:
                warning_messages = "; ".join(str(item.message) for item in reader_warnings)
                print(f"MotionReader warning for {mocap_file}: {warning_messages}")

            save_npy_path = Path.joinpath(npy_dir_path, Path(mocap_file).stem)  # Remove file extension

            pos = np.asarray(reader.motion.get_positions())
            rot = np.array(reader.motion.get_rotations())
            # combines position and rotation arrays to (frames, joints, 7): [x, y, z, qx, qy, qz, qw]
            out = np.concatenate((pos, rot), axis = 2)

            print(f"numpy shape for {mocap_file}: {out.shape}")
            np.save(save_npy_path, out)
            print(f"Successful converted {mocap_file} to {save_npy_path}")

            joint_graph = reader.skeleton.joint_graph
            with open(skeleton_dir_path / f"{Path(mocap_file).stem}.json", "w") as json_file:
                json.dump(joint_graph, json_file, indent=4)
            print(f"Successful built skeleton for {mocap_file}")

            Path(mocap_file).unlink()
            print(f"Deleted successfully converted original file {mocap_file}")
            converted_count += 1
        except Exception as conversion_error:
            failed_count += 1
            print(f"Could not convert motion file {mocap_file}: {conversion_error}")

    if converted_count == 0:
        return {
            "message": "",
            "warning": "No files were converted. Check whether the selected descriptor type matches the motion files.",
        }

    if failed_count > 0:
        return {
            "message": "",
            "warning": f"{converted_count} file(s) converted; {failed_count} file(s) could not be converted.",
        }

    return {
        "message": "pose viewer compatible files converted",
        "warning": "",
    }
