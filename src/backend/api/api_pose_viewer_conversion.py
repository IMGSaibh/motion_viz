from pathlib import Path
from fastapi import APIRouter
from backend.motion_parser.pv_parser import PVParser

router = APIRouter()
workspacefolder = Path.cwd()

@router.post("/convert_pv_style")
async def convert_pv_style():
    workspacefolder = Path.cwd()
    mvnx_dir_path = Path.joinpath(workspacefolder, "data/mvnx/")
    npy_dir_path = Path.joinpath(workspacefolder, "data/npy")
    json_dir = Path.joinpath(workspacefolder, "data/json")


    mvnx_dir_path.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)
    npy_dir_path.mkdir(parents=True, exist_ok=True)
    
    mvnx_files = list(mvnx_dir_path.glob("*.mvnx"))

    if not mvnx_files:
        return {
            "message": "",
            "warning": "no pose viewer compatible files found.",
        }
    

    # pairs of descriptor_file und mocap_file
    file_pairs = [
        (Path.joinpath(workspacefolder, "data/json/common/bvh_pos_100.json"),
        Path.joinpath(workspacefolder, "data/bvh/movement3_OvercomeObstacle_var1.bvh")),                # 3dmotaas
        
        (Path.joinpath(workspacefolder, "data/json/100style.json"),
        Path.joinpath(workspacefolder, "data/bvh/BentForward_SR.bvh")),                                 # 100style

        (Path.joinpath(workspacefolder, "data/json/bvh_pos_100.json"),
        Path.joinpath(workspacefolder, "data/bvh/Female1_D3_ConversationGestures.bvh")),                # accad

        (Path.joinpath(workspacefolder, "data/json/bvh_pos_100.json"),
        Path.joinpath(workspacefolder, "data/bvh/F01A0V1.bvh")),                                        # actors

        (Path.joinpath(workspacefolder, "data/json/aimove.json"),
        Path.joinpath(workspacefolder, "data/bvh/S3P03R3.bvh")),                                        # aimove

        (Path.joinpath(workspacefolder, "data/json/xsens_mvnx.json"),                                   # andy
        Path.joinpath(workspacefolder, "data/npy/Participant_541_Setup_A_Seq_4_Trial_2.xsens.mvnx")), 

        (Path.joinpath(workspacefolder, "data/json/carda.json"),                                        # carda
        Path.joinpath(workspacefolder, "data/npy/xsens_003_WS10_2023_09_21_cropped.bvh")), 

        (Path.joinpath(workspacefolder, "data/json/bvh_pamasss_100.json"),                            # circle
        Path.joinpath(workspacefolder, "data/bvh/002_reaching.bvh")),

        (Path.joinpath(workspacefolder, "data/json/bvh_pamasss_100.json"),                            # cmcd
        Path.joinpath(workspacefolder, "data/bvh/Take_2019-01-09_E_Hindernis.bvh")),

        (Path.joinpath(workspacefolder, "data/json/bvh_pamasss_100.json"),                            # crea3d
        Path.joinpath(workspacefolder, "data/bvh/U009_RWLV_CI1V_motion.bvh")),

        (Path.joinpath(workspacefolder, "data/json/bvh_pamasss_100.json"),                            # dance
        Path.joinpath(workspacefolder, "data/bvh/Clio_Haniotikos_short.bvh")),

        (Path.joinpath(workspacefolder, "data/json/bvh_pamasss_100.json"),                            # dance 2
        Path.joinpath(workspacefolder, "data/bvh/Clio_Haniotikos.bvh")),

        (Path.joinpath(workspacefolder, "data/json/xsens_mvnx.json"),                               # mvnx
        Path.joinpath(workspacefolder, "data/mvnx/short.mvnx")),


    ]

    for descriptor_file, mocap_file in file_pairs:
        print(f"processing {mocap_file}")
        print(f"processing {descriptor_file}")

        pv_parser = PVParser(str(mocap_file), descriptor_file)
        save_npy_path = Path.joinpath(npy_dir_path, f"{mocap_file.stem}")  # Remove file extension
        pv_parser.save_npy(str(save_npy_path))
        print(f"Datei gespeichert: {save_npy_path}")

    return {
        "message": "pose viewer compatible files converted",
        "warning": "",
    }
