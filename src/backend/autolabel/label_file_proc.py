import json
import pandas as pd
import numpy as np
import pathlib

from motionstack.reader import MotionReader

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
    motion_data = MotionReader(
        motion_filename,
        'bvh_100'
    )

    motion_rs = np.array(motion_data.motion.get_rotations())    
    motion_ps = np.array(motion_data.motion.get_positions())

    df = pd.DataFrame(columns=['FILEPATH', 'FRAME_INDEX', 'ORIENTATION', 'POSITION', 'LABEL', 'ERGO_METHOD'])

    for label in label_data['labels']:
        s = label['start_frame']
        e = label['end_frame']
        for frame_nr in range (s,e):
            
            df.loc[len(df)] = {  
            'FILEPATH':  filepath,
            'FRAME_INDEX': frame_nr,            
            'ORIENTATION' : motion_rs[frame_nr],
            'POSITION' : motion_ps[frame_nr],
            'LABEL': [item["element_id"] for item in label["categories"]],
            'ERGO_METHOD': label['ergo_method']
            }

    return df

def get_X_y_from_dataframe(df):

    l = np.array(df['ORIENTATION'].tolist(), dtype='float64')
    X = l.astype('float64')
    y = np.array(df['LABEL'].tolist(), dtype='int')
    X_scaled, scaler = scale_data(X)

    return X_scaled, y, scaler

def scale_data(X):
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    #X = X.reshape(-1, X.shape[-1])
    X_scaled = scaler.fit_transform(X)#.reshape(X.shape)
    return X_scaled, scaler


def process(filepath):
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