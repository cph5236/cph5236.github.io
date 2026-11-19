#!/usr/bin/env python3
"""Generate the Hanlin Software logo, favicons and default OG image.

Needs fontTools + Pillow and the JetBrains Mono TTFs (SemiBold, ExtraBold,
Regular) from https://github.com/JetBrains/JetBrainsMono/tree/master/fonts/ttf

Usage: python tools/make_brand.py <font_dir> [out_dir]
       (default out_dir: public/assets/img/brand)

The SVGs contain outlined glyphs, so they render without the webfont.
"""
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ACCENT = "#f5b43a"
TEXT = "#e9ebf0"
BG = "#0f1115"
TIGHT = -0.12  # letter-spacing (em) inside the bracket H (wordmark)
TIGHT_MARK = -0.24  # tighter for the standalone icon

# (text, weight, colour, opacity, tight-spacing)
WORDMARK = [
    ("]", "ExtraBold", ACCENT, 1.0, True),
    ("-", "ExtraBold", TEXT, 1.0, True),
    ("[", "ExtraBold", ACCENT, 1.0, False),
    ("anlin", "SemiBold", TEXT, 1.0, False),
    (".software", "SemiBold", TEXT, 0.55, False),
]
MARK = [
    ("]", "ExtraBold", BG, 1.0, "mark"),
    ("-", "ExtraBold", BG, 1.0, "mark"),
    ("[", "ExtraBold", BG, 1.0, False),
]


class Fonts:
    def __init__(self, font_dir: Path):
        self.dir = font_dir
        self.tt = {}

    def path(self, weight: str) -> Path:
        return self.dir / f"JetBrainsMono-{weight}.ttf"

    def ttfont(self, weight: str) -> TTFont:
        if weight not in self.tt:
            self.tt[weight] = TTFont(self.path(weight))
        return self.tt[weight]


def layout(fonts: Fonts, parts, size: float):
    """Yield (char, weight, colour, opacity, x) in px for a given font size."""
    x = 0.0
    for text, weight, colour, opacity, tight in parts:
        f = fonts.ttfont(weight)
        upm = f["head"].unitsPerEm
        cmap, hmtx = f.getBestCmap(), f["hmtx"]
        for ch in text:
            yield ch, weight, colour, opacity, x
            spacing = TIGHT_MARK if tight == "mark" else TIGHT if tight else 0
            x += hmtx[cmap[ord(ch)]][0] / upm * size + spacing * size
    yield None, None, None, None, x


def svg_paths(fonts: Fonts, parts, size: float, baseline: float, x0: float = 0):
    out, width = [], 0
    for ch, weight, colour, opacity, x in layout(fonts, parts, size):
        if ch is None:
            width = x
            break
        f = fonts.ttfont(weight)
        scale = size / f["head"].unitsPerEm
        gs = f.getGlyphSet()
        pen = SVGPathPen(gs)
        gs[f.getBestCmap()[ord(ch)]].draw(
            TransformPen(pen, (scale, 0, 0, -scale, x0 + x, baseline)))
        op = f' fill-opacity="{opacity}"' if opacity < 1 else ""
        out.append(f'<path fill="{colour}"{op} d="{pen.getCommands()}"/>')
    return out, width


def write_logo_svg(fonts: Fonts, out: Path):
    size, pad = 64, 8
    paths, width = svg_paths(fonts, WORDMARK, size, baseline=size * 0.98 + pad, x0=pad)
    w, h = round(width + 2 * pad), round(size * 1.3 + 2 * pad)
    (out / "logo.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="Hanlin Software">{"".join(paths)}</svg>\n')


def write_favicon_svg(fonts: Fonts, out: Path):
    size = 38
    paths, width = svg_paths(fonts, MARK, size, baseline=0)
    # centre the mark in a 64x64 tile; glyph cap height ~0.73em
    dx, dy = (64 - width) / 2, 32 + size * 0.73 / 2 - 2
    paths, _ = svg_paths(fonts, MARK, size, baseline=dy, x0=dx)
    (out / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        f'<rect width="64" height="64" rx="14" fill="{ACCENT}"/>{"".join(paths)}</svg>\n')


def draw_parts(img: Image.Image, fonts: Fonts, parts, size: int, x0: float, baseline: float):
    for ch, weight, colour, opacity, x in layout(fonts, parts, size):
        if ch is None:
            return x
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((x0 + x, baseline), ch, font=ImageFont.truetype(
            str(fonts.path(weight)), size), fill=colour, anchor="ls")
        if opacity < 1:
            layer.putalpha(layer.getchannel("A").point(lambda a: int(a * opacity)))
        img.alpha_composite(layer)


def width_of(fonts: Fonts, parts, size: int) -> float:
    return list(layout(fonts, parts, size))[-1][4]


def write_pngs(fonts: Fonts, out: Path):
    # Wordmark on dark, 1200 wide
    size = 120
    w = width_of(fonts, WORDMARK, size)
    size = int(size * 1100 / w)
    w = width_of(fonts, WORDMARK, size)
    img = Image.new("RGBA", (1200, 300), BG)
    draw_parts(img, fonts, WORDMARK, size, (1200 - w) / 2, 150 + size * 0.36)
    img.convert("RGB").save(out / "logo.png", optimize=True)

    # Default Open Graph image 1200x630
    size = int(120 * 1000 / w)
    w = width_of(fonts, WORDMARK, size)
    img = Image.new("RGBA", (1200, 630), BG)
    draw_parts(img, fonts, WORDMARK, size, (1200 - w) / 2, 300)
    tag = "Independent studio making games & apps"
    f = ImageFont.truetype(str(fonts.path("Regular")), 36)
    ImageDraw.Draw(img).text((600, 400), tag, font=f, fill="#a3a8b4", anchor="ms")
    img.convert("RGB").save(out / "og-default.png", optimize=True)

    # Icon tiles
    for name, px in (("favicon-32.png", 32), ("apple-touch-icon.png", 180), ("icon-512.png", 512)):
        scale = 8 if px < 64 else 1
        s = px * scale
        img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        radius = 0 if name == "apple-touch-icon.png" else round(s * 14 / 64)
        ImageDraw.Draw(img).rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=ACCENT)
        gsize = round(s * 38 / 64)
        gw = width_of(fonts, MARK, gsize)
        draw_parts(img, fonts, MARK, gsize, (s - gw) / 2, s / 2 + gsize * 0.73 / 2 - s / 32)
        if scale > 1:
            img = img.resize((px, px), Image.LANCZOS)
        img.save(out / name, optimize=True)


def main():
    fonts = Fonts(Path(sys.argv[1]))
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "public/assets/img/brand")
    out.mkdir(parents=True, exist_ok=True)
    write_logo_svg(fonts, out)
    write_favicon_svg(fonts, out)
    write_pngs(fonts, out)
    for p in sorted(out.iterdir()):
        print(p, p.stat().st_size)


if __name__ == "__main__":
    main()
