from typing import List, Any

class Utils:

    @staticmethod
    def get_index_of_key(arr: List[Any], key: Any) -> int:
        if key in arr:
            return arr.index(key)
        else:
            print("Key {} not in array. Returning -1 as index.".format(key))
            return -1