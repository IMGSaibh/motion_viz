class Utils:

    @staticmethod
    def get_index_of_key(arr, key):
        try:
            return arr.index(key)
        except:
            print("Key {} not in array. Returning -1 as index.".format(key))
            return -1