import json
import pandas as pd
import numpy as np
import mocap_loader as mol
import pathlib

import os
THIS_DIR = pathlib.Path(__file__)


def load_label_json_label_file(filepath):
    with open(filepath) as f:
        json_data = json.load(f)
        return json_data

def get_motion_filename_from_label_filename(label_filename):
    filename = pathlib.Path(label_filename).stem
    # ref. issue #69
    ret = os.path.join(THIS_DIR.parent.parent.parent.parent,'data/bvh', filename + '.' + 'bvh')
    return ret

def get_label_filename_from_motion_filename(motion_filename):
    # TODO
    pass

def create_dataframe_from_json_label_file(filepath):
    label_data = load_label_json_label_file(filepath)

    motion_filename = get_motion_filename_from_label_filename(filepath)
    motion_data = mol.MotionDataReader(
        motion_filename,
        'bvh_pos_100'
    )
    dataframe = pd.DataFrame(columns=['FILEPATH', 'FRAME_INDEX', 'ORIENTATION', 'POSITION', 'LABEL', 'ERGO_METHOD'])

    for label in label_data.labels:
        for fix in range (label['start_frame', label['end_frame']]):
            dataframe['FILEPATH'] = filepath
            dataframe['FRAME_INDEX'] = fix
            dataframe['ORIENTA']




create_dataframe_from_json_label_file('/home/aiwlab/hack/motion_viz/data/labels/NaturalTalking_01.bvh_short.json')
    
