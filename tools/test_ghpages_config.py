#!/usr/bin/env python3
"""GitHub Pages (Jekyll) must publish only the redirect stubs.

Every tracked top-level entry except index.html, 404.html and dotfiles
must be listed in _config.yml `exclude`. Run: python3 tools/test_ghpages_config.py
"""
import re
import subprocess
import sys
from pathlib import Path

KEEP = {"index.html", "404.html", "_config.yml"}
tracked = {p.split("/")[0] for p in subprocess.check_output(["git", "ls-files"], text=True).split()}
cfg = Path("_config.yml")
excluded = set(re.findall(r"^\s*-\s*(\S+)", cfg.read_text(), re.M)) if cfg.exists() else set()
missing = sorted(t for t in tracked - KEEP - excluded if not t.startswith("."))
for m in missing:
    print(f"FAIL {m} would be published on cph5236.github.io")
print("PASS" if not missing else f"FAILED: {len(missing)} entries")
sys.exit(1 if missing else 0)
