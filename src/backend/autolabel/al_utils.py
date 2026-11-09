import numpy as np
from typing import Tuple
from sklearn.preprocessing import StandardScaler

# --------------------------------------------------------------------------- #
# Helper – simple wrapper around StandardScaler (kept public for re‑use)
# --------------------------------------------------------------------------- #

def one_hot_encode_labels(df, max_length, column="LABEL"):
    def encode_cell(cell):
        return [
            # -1 to match feature id with array index
            np.eye(max_length, dtype=int)[np.array(labels) - 1].sum(axis=0)
            for labels in cell
        ]

    df = df.copy()
    df["ONEHOT"] = df[column].apply(encode_cell)
    return df
    
def redo_one_hot(arr, dimension, length):
    arr = np.array(arr).reshape(length, dimension)
    return tuple(np.argmax(row) + 1 for row in arr)

    
def scale_data(X: np.ndarray) -> Tuple[np.ndarray, StandardScaler]:
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, scaler