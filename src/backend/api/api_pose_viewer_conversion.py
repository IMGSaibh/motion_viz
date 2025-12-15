from pathlib import Path
from fastapi import APIRouter
from backend.motion_parser.pv_parser import PVParser
from mocap_loader import MotionDataReader

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
    # ======================================= Arbeitstätigkeiten =======================================
    file_pairs = [

        (f"{workspacefolder}data/bvh/S3P03R3.bvh",
        "bvh_pos_100.json"),                                                                            # aimove

        # (Path.joinpath(workspacefolder, "data/bvh/Subj_01_Isokin_L_02kg_St.mvnx"),
        #  Path.joinpath(workspacefolder, "data/json/common/xsens_mvnx.json")),                             # mmhd

        # (Path.joinpath(workspacefolder, "data/bvh/xsens_003_WS10_2023_09_21_cropped.bvh"),
        #  Path.joinpath(workspacefolder, "data/json/common/bvh_pos_1000.json")),                        # carda

        # (Path.joinpath(workspacefolder, "data/bvh/Participant_541_Setup_A_Seq_4_Trial_2.xsens.mvnx"),
        #  Path.joinpath(workspacefolder, "data/json/xsens_mvnx.json")),                                  # andy

        # (Path.joinpath(workspacefolder, "data/bvh/P01_R01_short.bvh"),
        #  Path.joinpath(workspacefolder, "data/json/bvh_pos_100.json")),                                  # inhard

        # (Path.joinpath(workspacefolder, "data/bvh/7-10-09-cleaning-002-suitA.bvh"),
        #  Path.joinpath(workspacefolder, "data/json/bvh_pos_100.json")),                                 # Vicon Poeticon

        # (
        # Path.joinpath(workspacefolder, "data/bvh/L02_S01_R04_A17_N01_norm_data.csv"),
        # Path.joinpath(workspacefolder, "data/json/lara.json"),),                                    #  Lara


    ]

    # reader = MotionDataReader(f"{workspacefolder}data/bvh/S3P03R3.bvh","bvh_pos_100.json")

    # if reader.positions is None:
    #     raise ValueError("reader.positions ist None – Datei wurde nicht korrekt geladen")
    # positions = reader.positions * 100 # Convert from centimeters to meters
    # r_hierarchy = reader.generateJointHierarchyArray()
    # joint_names = reader.generateNameList()
    # joint_graph = reader.joint_graph

    # for mocap_file, descriptor_file in file_pairs:
    #     print(f"processing {mocap_file}")
    #     print(f"processing {descriptor_file}")

    #     pv_parser = PVParser(mocap_file, descriptor_file)
    #     save_npy_path = Path.joinpath(npy_dir_path, f"{mocap_file}")  # Remove file extension
    #     pv_parser.save_npy(str(save_npy_path))
    #     print(f"Datei gespeichert: {save_npy_path}")

    return {
        "message": "pose viewer compatible files converted",
        "warning": "",
    }
