"""Download verified CC0 glTF sets from Poly Haven with their local texture dependencies."""
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen


def fetch(url):
    if not url.startswith(("https://api.polyhaven.com/", "https://dl.polyhaven.org/")):
        raise ValueError("Unexpected asset host")
    with urlopen(Request(url, headers={"User-Agent": "Veyravelune asset preparation"}), timeout=60) as response:
        return response.read()


for asset in ("GothicBed_01", "mid_century_lounge_chair", "side_table_01"):
    target = Path("public/models") / asset
    manifest = json.loads(fetch("https://api.polyhaven.com/files/" + asset))["gltf"]["1k"]["gltf"]
    metadata = json.loads(fetch("https://api.polyhaven.com/info/" + asset))
    print(asset, metadata.get("authors"), flush=True)
    for name, item in {"model.gltf": manifest, **manifest["include"]}.items():
        path = (target / name).resolve()
        if not path.is_relative_to(target.resolve()):
            raise ValueError(name)
        payload = fetch(item["url"])
        if hashlib.md5(payload).hexdigest() != item["md5"]:
            raise ValueError("Invalid download " + name)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
