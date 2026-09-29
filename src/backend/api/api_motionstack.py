import json
import warnings
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
    file_pairs = [

        # # aimove
        # (f"{orignals_dir_path}/S3P03R3.bvh","bvh_100"),                                                                            

        # # mmhd
        # (f"{orignals_dir_path}/Subj_01_Isokin_L_02kg_St.mvnx","xsens_mvnx"),                                                                                 

        # # carda
        # (f"{orignals_dir_path}/xsens_003_WS10_2023_09_21_cropped.bvh","bvh_1000"),                                                                          

        # # andy data
        # (f"{orignals_dir_path}/Participant_541_Setup_A_Seq_4_Trial_2.xsens.mvnx","xsens_mvnx"),                                                                 

        # # inhard
        # (f"{orignals_dir_path}/P01_R01_short.bvh","bvh_100"),

        # # # Vicon Poeticon
        # (f"{orignals_dir_path}/7-10-09-cleaning-002-suitA.bvh","bvh_100"),                                                                               

        # #  Lara 
        # (f"{orignals_dir_path}/L02_S01_R04_A17_N01_norm_data.csv","lara_csv"),                                                                                        

    ]

    mvnx_files = list(orignals_dir_path.glob("*.mvnx"))
    bvh_files = list(orignals_dir_path.glob("*.bvh"))


    if not mvnx_files and not bvh_files:
        return {
            "message": "",
            "warning": "no pose viewer compatible files found.",
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
