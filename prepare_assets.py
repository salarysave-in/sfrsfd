"""Restore the public artwork, fonts and audio for this release."""
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
from urllib.request import urlopen
import json

root = Path(__file__).resolve().parent
assets = json.loads((root / "assets.json").read_text())

def restore(item):
    name, expected = item
    target = root / "public" / name
    if target.is_file() and sha256(target.read_bytes()).hexdigest() == expected:
        return
    with urlopen("https://salarysave.in/" + name, timeout=60) as response:
        data = response.read()
    if sha256(data).hexdigest() != expected:
        raise ValueError("Asset differs from the recovered release: " + name)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(restore, assets.items()))
