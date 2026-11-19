#!/usr/bin/env python3
"""Static checks for the published site in public/.

- every local href/src in public/**/*.html resolves to a file in public/
- every <img> has an alt attribute (empty alt = decorative)
- repo internals (incl. any .md notes) are not inside public/

Usage: python3 tools/check_site.py [site_dir]   (default: public)
Exit code 0 = all good; failures are printed as "FAIL <page>: <reason>".
"""
import sys
from html.parser import HTMLParser
from pathlib import Path

FORBIDDEN = ["CLAUDE.md", "README.md", "package.json", "package-lock.json",
             "docs", "wrangler.toml", "node_modules", ".claude", "tools"]
EXTERNAL = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:", "#")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.bad_imgs = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for key in ("href", "src"):
            if a.get(key):
                self.refs.append(a[key])
        # alt="" is valid for decorative images; only a missing alt fails
        if tag == "img" and "alt" not in a:
            self.bad_imgs.append(a.get("src", "?"))


def resolve(site: Path, page: Path, ref: str) -> Path:
    ref = ref.split("#")[0].split("?")[0]
    target = site / ref.lstrip("/") if ref.startswith("/") else page.parent / ref
    if ref.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target


def main() -> int:
    site = Path(sys.argv[1] if len(sys.argv) > 1 else "public")
    failures = []
    if not site.is_dir():
        print(f"FAIL {site}: directory missing")
        return 1
    for name in FORBIDDEN:
        if (site / name).exists():
            failures.append(f"FAIL {site}: repo internal '{name}' is published")
    for doc in sorted(p for p in site.rglob("*") if p.suffix.lower() == ".md"):
        failures.append(f"FAIL {doc.relative_to(site)}: markdown notes are published")
    for page in sorted(site.rglob("*.html")):
        c = Collector()
        c.feed(page.read_text(encoding="utf-8"))
        rel = page.relative_to(site)
        for ref in c.refs:
            if ref.startswith(EXTERNAL) or not ref.strip():
                continue
            if not resolve(site, page, ref).exists():
                failures.append(f"FAIL {rel}: broken link {ref}")
        for src in c.bad_imgs:
            failures.append(f"FAIL {rel}: <img src={src}> missing alt")
    for f in failures:
        print(f)
    pages = len(list(site.rglob("*.html")))
    print(f"{'PASS' if not failures else 'FAILED'}: {pages} pages, {len(failures)} problems")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
