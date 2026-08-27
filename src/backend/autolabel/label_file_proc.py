
import json
import pandas as pd
import numpy as np
from mocap_loader import MotionDataReader 
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
    motion_data = MotionDataReader(
        motion_filename,
        'bvh_pos_100'
    )
    df = pd.DataFrame(columns=['FILEPATH', 'FRAME_INDEX', 'ORIENTATION', 'POSITION', 'LABEL', 'ERGO_METHOD'])

    for label in label_data['labels']:
        s = label['start_frame']
        e = label['end_frame']
        for frame_nr in range (s,e):
            
            df.loc[len(df)] = {  
            'FILEPATH':  filepath,
            'FRAME_INDEX': frame_nr,            
            'ORIENTATION' : motion_data.motion.rotations[frame_nr],
            'POSITION' : motion_data.motion.positions[frame_nr],
            'LABEL': [item["element_id"] for item in label["categories"]],
            'ERGO_METHOD': label['ergo_method']
            }

    return df

def get_X_y_from_dataframe(df):
    X = np.array(df[['ORIENTATION']].to_numpy().tolist())
    y = np.array(df['LABEL'].to_numpy().tolist())
    X_scaled, scaler = scale_data(X)

    return X_scaled, y, scaler

def scale_data(X):
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X.reshape(-1, X.shape[-1])).reshape(X.shape)
    return X_scaled, scaler


def process_label_file(filepath):
    # if corresponsig pkl available
    if os.path.exists(os.path.join('/home/aiwlab/hack/motion_viz/data/labels/',pathlib.Path(filepath).stem + '.pkl')):
        df = pd.read_pickle(os.path.join('/home/aiwlab/hack/motion_viz/data/labels/',pathlib.Path(filepath).stem + '.pkl'))
    # if not
    else:    
        # create dataframe
        df = create_dataframe_from_json_label_file(filepath)
        # save as pkl
        df.to_pickle(os.path.join('/home/aiwlab/hack/motion_viz/data/labels/',pathlib.Path(filepath).stem + '.pkl'))

    X, y, scaler = get_X_y_from_dataframe(df)
    return X, y, scaler