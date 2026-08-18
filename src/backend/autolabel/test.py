
from pathlib import Path
import numpy as np
from typing import Any, List

def print_ok(filename: str, labels: List[Any] = None):
    print(f"print_ok called with filename: {filename}")
    if labels is not None:
        print(f"Labels: {labels}")
    else:
        print("No labels provided.")
