import pandas as pd
import numpy as np

class CSVParser:
    def __init__(self, file_path):
        self.file_path = file_path

    def csv_to_numpy(self, num_joints: int) -> np.ndarray:
        df = pd.read_csv(self.file_path)
        nframes = df.shape[0]
        data = df.iloc[:, 1:].values.reshape(nframes, num_joints, 3)
        return data.astype(np.float32)