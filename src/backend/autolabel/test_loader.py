from label_load import LabelLoader
from motionstack.reader import MotionReader

# ------------------------------------------------------------------- #
# One‑time construction – adapt the paths to your environment
# ------------------------------------------------------------------- #
processor = LabelLoader(
    label_root="data/labels",
    bvh_root="data/bvh",
    cache_root="data/labels",  # we reuse the label folder for the cache
    motion_reader_cls=MotionReader,   # default; replace with a mock in tests
    motion_suffix="bvh_100",
)

# ------------------------------------------------------------------- #
# Process a single JSON file (relative or absolute path works)
# ------------------------------------------------------------------- #
X, y, scaler = processor.load("NaturalTalking_01.bvh_short.json")

print("X shape:", X.shape)          # e.g. (n_frames, n_joints*4)
print("y shape:", y.shape)          # e.g. (n_frames, n_labels_per_frame)
print("First 5 rows of y:", y[:5])