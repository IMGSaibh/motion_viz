import json
from pathlib import Path
from typing import Any, Union, List, Dict, Optional

class JsonLoader:


    def __init__(self, path: Union[str, Path]) -> None:
        self.path = Path(path)
        self._data: Dict[str, Any] = {}
        self._load()

    def get(self, key: str, default: Optional[Any] = None, required: bool = True,) -> Any:
        value, found = self._traverse(key)
        if not found:
            if required:
                raise KeyError(f"Key '{key}' not found in {self.path}")
            return default
        return value
    
    def to_dict(self) -> Dict[str, Any]:
        return self._data.copy()
    
    def _load(self) -> None:
        if not self.path.is_file():
            raise FileNotFoundError(self.path)
        with self.path.open(encoding="utf-8") as f:
            self._data = json.load(f)

    def _traverse(self, dotted_key: str) -> tuple[Any, bool]:
        current: Any = self._data
        parts: List[str] = dotted_key.split(".")
        for part in parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None, False
        return current, True