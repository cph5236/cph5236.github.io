#!/usr/bin/env python3
"""Download and web-size product art into public/assets/img/<product>/.

Sources:
  brewery  cph5236/BrwerySim @ M6-int, SteamStore/ (private, Git LFS)
  heap     cph5236/HeapGame @ main (public)
  weather  cph5236/SimpleWeatherService @ HEAD (public); app screenshots are
           captured separately from the live web app.

Needs Pillow and an authenticated `gh` CLI (for the private repo + LFS).
Re-run after the Brewery screenshots are retaken: python tools/fetch_assets.py brewery
"""
import base64
import io
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image

OUT = Path("public/assets/img")
MAX_BYTES = 300_000


def gh_api(path: str) -> dict:
    return json.loads(subprocess.check_output(["gh", "api", path]))


def gh_file(repo: str, ref: str, path: str) -> bytes:
    """Fetch a file via the contents API; resolves Git LFS pointers."""
    meta = gh_api(f"repos/{repo}/contents/{path}?ref={ref}")
    if meta.get("content"):
        data = base64.b64decode(meta["content"])
    else:  # files over 1 MB come back without inline content
        data = subprocess.check_output(["gh", "api", "-H", "Accept: application/vnd.github.raw",
                                        f"repos/{repo}/contents/{path}?ref={ref}"])
    if not data.startswith(b"version https://git-lfs"):
        return data
    fields = dict(line.split(" ", 1) for line in data.decode().splitlines() if " " in line)
    oid, size = fields["oid"].removeprefix("sha256:"), int(fields["size"])
    token = subprocess.check_output(["gh", "auth", "token"]).decode().strip()
    req = urllib.request.Request(
        f"https://github.com/{repo}.git/info/lfs/objects/batch",
        data=json.dumps({"operation": "download", "objects": [{"oid": oid, "size": size}]}).encode(),
        headers={"Accept": "application/vnd.git-lfs+json",
                 "Content-Type": "application/vnd.git-lfs+json",
                 "Authorization": "Basic " + base64.b64encode(f"x:{token}".encode()).decode()})
    href = json.load(urllib.request.urlopen(req))["objects"][0]["actions"]["download"]["href"]
    return urllib.request.urlopen(href).read()


def save(data: bytes, dest: Path, width: int, fmt: str = "JPEG"):
    """Resize to `width` (never upscale) and save under MAX_BYTES."""
    img = Image.open(io.BytesIO(data))
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "PNG":
        img.save(dest, "PNG", optimize=True)
    else:
        img = img.convert("RGB")
        for q in (82, 75, 68, 60):
            img.save(dest, "JPEG", quality=q, optimize=True, progressive=True)
            if dest.stat().st_size <= MAX_BYTES:
                break
    print(f"{dest} {img.width}x{img.height} {dest.stat().st_size // 1024}KB")


BREWERY_SHOTS = ["brewery_brewhouse_wide", "taproom_wide_evening", "town_main_street",
                 "coop_brewhouse", "closeup_kettle_boil", "brewery_production_hall",
                 "town_brewery_front", "closeup_dog"]


def brewery():
    repo, ref, base, out = "cph5236/BrwerySim", "M6-int", "SteamStore", OUT / "brewery"
    for name in ("keyart_craft_brewery", "keyart_brewhouse"):
        data = gh_file(repo, ref, f"{base}/web/keyart/{name}_1920x1080.jpg")
        save(data, out / f"{name}.jpg", 1920)
        save(data, out / f"{name}-960.jpg", 960)
    save(gh_file(repo, ref, f"{base}/web/title-screen/title_screen_1920x1080.jpg"),
         out / "title-screen.jpg", 1600)
    for name in BREWERY_SHOTS:
        data = gh_file(repo, ref, f"{base}/web/screenshots/{name}.jpg")
        save(data, out / "shots" / f"{name}.jpg", 1600)
        save(data, out / "shots" / f"{name}-640.jpg", 640)
    save(gh_file(repo, ref, f"{base}/logo/craft-brewery-simulator-logo-1024.png"),
         out / "logo.png", 720, "PNG")


HEAP_SHOTS = ["01-climb", "02-place", "03-salvage", "04-leaderboard", "05-custom", "06-enemy", "07-upgrades"]


def heap():
    repo, ref, out = "cph5236/HeapGame", "main", OUT / "heap"
    save(gh_file(repo, ref, "assets/play-event/grand-opening-clean.jpg"), out / "keyart.jpg", 1920)
    save(gh_file(repo, ref, "assets/play-event/grand-opening-clean.jpg"), out / "keyart-960.jpg", 960)
    save(gh_file(repo, ref, "assets/icon-only.png"), out / "icon.png", 256, "PNG")
    listing = {i["name"]: i["path"] for i in gh_api(f"repos/{repo}/contents/assets/play-listing?ref={ref}")}
    for stem in HEAP_SHOTS:
        path = listing.get(f"{stem}.png")
        if path:
            save(gh_file(repo, ref, path), out / "shots" / f"{stem}.jpg", 540)


def weather():
    repo, ref, out = "cph5236/SimpleWeatherService", "HEAD", OUT / "weather"
    save(gh_file(repo, ref, "SWS_App/public/Logo.png"),
         out / "icon.png", 256, "PNG")


if __name__ == "__main__":
    for name in sys.argv[1:] or ["brewery", "heap", "weather"]:
        globals()[name]()
