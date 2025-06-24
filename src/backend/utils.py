import math
import numpy as np
from typing import List, Any
from scipy.spatial.transform import Rotation as R

class Utils:

    @staticmethod
    def get_index_of_key(arr: List[Any], key: Any) -> int:
        if key in arr:
            return arr.index(key)
        else:
            print("Key {} not in array. Returning -1 as index.".format(key))
            return -1
        
    @staticmethod
    def rotation_matrices(x, y, z, order):
        rx = np.array([
            [1, 0, 0],
            [0, math.cos(math.radians(x)), -math.sin(math.radians(x))],
            [0, math.sin(math.radians(x)), math.cos(math.radians(x))]
        ])

        ry = np.array([
            [math.cos(math.radians(y)), 0, math.sin(math.radians(y))],
            [0, 1, 0],
            [-math.sin(math.radians(y)), 0, math.cos(math.radians(y))]
        ])

        rz = np.array([
            [math.cos(math.radians(z)), -math.sin(math.radians(z)), 0],
            [math.sin(math.radians(z)), math.cos(math.radians(z)), 0],
            [0, 0, 1]
        ])

        matrices = {"X": rx, "Y": ry, "Z": rz}
        # R = np.identity(3)
        # for axis in order:
        #     R = R @ matrices[axis.upper()]
        # return R

        # Eingehende Werte werden einem Dict zugeordnet
        value_dict = dict(zip("XYZ", [x, y, z]))

        # Extrahiere die Werte gemäß der Rotationsreihenfolge
        ordered_values = [value_dict[axis.upper()] for axis in order]

        # scipy nutzt Kleinschreibung im Order-String
        return R.from_euler(order.lower(), ordered_values, degrees=True).as_matrix()