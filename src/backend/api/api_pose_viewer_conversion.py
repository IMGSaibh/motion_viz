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
    

    # Pairs of descriptor_file and mocap_file
    # ======================================= Work activities =======================================
    file_pairs = [

        # aimove
        (f"{workspacefolder}/data/bvh/S3P03R3.bvh",
        "bvh_pos_100"),                                                                            

        # mmhd
        (f"{workspacefolder}/data/mvnx/Subj_01_Isokin_L_02kg_St.mvnx",
          "xsens_mvnx"),                                                                                 

        # carda
        (f"{workspacefolder}/data/bvh/xsens_003_WS10_2023_09_21_cropped.bvh",
          "bvh_pos_1000"),                                                                          

        # andy data
        (f"{workspacefolder}/data/mvnx/Participant_541_Setup_A_Seq_4_Trial_2.xsens.mvnx",
                       "xsens_mvnx"),                                                                 

        # inhard
        (f"{workspacefolder}/data/bvh/P01_R01_short.bvh",
        "bvh_pos_100"),                                                                                  

        # # Vicon Poeticon
        (f"{workspacefolder}/data/bvh/7-10-09-cleaning-002-suitA.bvh",
          "bvh_pos_100"),                                                                               

        #  Lara 
        (f"{workspacefolder}/data/csv/L02_S01_R04_A17_N01_norm_data.csv",
        "lara_csv"),                                                                                        

    ]
    
    for mocap_file, descriptor_file in file_pairs:
        print(f"processing {mocap_file}")
        print(f"processing {descriptor_file}")

        pv_parser = PVParser(mocap_file, descriptor_file)
        save_npy_path = Path.joinpath(npy_dir_path, Path(mocap_file).stem)  # Remove file extension
        pv_parser.save_npy(str(save_npy_path))
        

    return {
        "message": "pose viewer compatible files converted",
        "warning": "",
    }
