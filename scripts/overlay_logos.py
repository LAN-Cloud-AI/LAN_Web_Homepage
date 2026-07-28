#!/usr/bin/env python3
"""Overlay WEB company logo onto generated marketing/UI PNGs, then refresh webp variants."""

from __future__ import annotations

import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "images/logo/WEB-logo-transparent.png"
GEN = ROOT / "images/generated"


def load_logo() -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    return logo


def sample_bg(img: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    """Sample a background color just outside the cover box."""
    x0, y0, x1, y1 = box
    w, h = img.size
    probes = [
        (max(0, x0 - 4), min(h - 1, (y0 + y1) // 2)),
        (min(w - 1, x1 + 4), min(h - 1, (y0 + y1) // 2)),
        (min(w - 1, (x0 + x1) // 2), max(0, y0 - 4)),
        (min(w - 1, (x0 + x1) // 2), min(h - 1, y1 + 4)),
    ]
    rgba = img.convert("RGBA")
    colors = [rgba.getpixel(p) for p in probes]
    # median-ish: pick the most common-ish by averaging
    r = sum(c[0] for c in colors) // len(colors)
    g = sum(c[1] for c in colors) // len(colors)
    b = sum(c[2] for c in colors) // len(colors)
    a = 255
    return (r, g, b, a)


def cover_and_stamp(
    base: Image.Image,
    logo: Image.Image,
    box: tuple[int, int, int, int],
    *,
    pad: float = 0.12,
    radius: int | None = None,
) -> None:
    """Fill box with nearby bg color, then stamp logo centered inside."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    bg = sample_bg(base, box)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    rr = radius if radius is not None else max(4, min(bw, bh) // 6)
    draw.rounded_rectangle([x0, y0, x1, y1], radius=rr, fill=bg)

    max_w = int(bw * (1 - pad * 2))
    max_h = int(bh * (1 - pad * 2))
    lw, lh = logo.size
    scale = min(max_w / lw, max_h / lh)
    nw, nh = max(1, int(lw * scale)), max(1, int(lh * scale))
    stamped = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    px = x0 + (bw - nw) // 2
    py = y0 + (bh - nh) // 2
    layer.alpha_composite(stamped, (px, py))
    base.alpha_composite(layer)


# Manually tuned boxes: (x0, y0, x1, y1) on source PNG pixel coords.
# Only company brand marks — not product icons or third-party logos.
PLACEMENTS: dict[str, list[tuple[int, int, int, int]]] = {
    # Sidebar brand icon + browser tab favicon
    "leadshunter/lh-dashboard-manager.png": [
        (48, 154, 80, 188),
        (138, 68, 166, 94),
    ],
    # Sidebar brand icon + tab favicon
    "vect/vect-customer-profile.png": [
        (16, 100, 76, 152),
        (104, 12, 138, 46),
    ],
    # Header brand icon (white cloud on dark bar)
    "tact/tact-digital-workorder.png": [
        (10, 6, 62, 50),
    ],
}


def export_webp(png: Path) -> None:
    """Regenerate responsive webp set next to a PNG."""
    cwebp = "cwebp"
    stem = png.stem
    parent = png.parent
    w, h = Image.open(png).size

    def run(src: Path, dst: Path, q: int = 78) -> None:
        subprocess.run([cwebp, "-q", str(q), "-m", "6", str(src), "-o", str(dst)], check=True, capture_output=True)

    # full
    run(png, parent / f"{stem}.webp", 78)

    # 768w
    tw = 768
    th = max(1, h * tw // w)
    tmp = Path(f"/tmp/lan-overlay-{stem}-768.png")
    Image.open(png).resize((tw, th), Image.Resampling.LANCZOS).save(tmp)
    run(tmp, parent / f"{stem}-768.webp", 78)

    if w > 1280:
        tw = 1280
        th = max(1, h * tw // w)
        tmp = Path(f"/tmp/lan-overlay-{stem}-1280.png")
        Image.open(png).resize((tw, th), Image.Resampling.LANCZOS).save(tmp)
        run(tmp, parent / f"{stem}-1280.webp", 80)
    elif h > 1280:
        tw = 1024
        th = max(1, h * tw // w)
        tmp = Path(f"/tmp/lan-overlay-{stem}-1024.png")
        Image.open(png).resize((tw, th), Image.Resampling.LANCZOS).save(tmp)
        run(tmp, parent / f"{stem}-1024.webp", 80)


def main() -> None:
    logo = load_logo()
    for rel, boxes in PLACEMENTS.items():
        path = GEN / rel
        if not path.exists():
            print("skip missing", rel)
            continue
        img = Image.open(path).convert("RGBA")
        for box in boxes:
            cover_and_stamp(img, logo, box)
        out = img.convert("RGB") if path.suffix.lower() == ".png" else img
        # keep PNG without alpha for consistency with existing assets
        out.save(path, optimize=True)
        print("updated", rel, "placements", len(boxes))
        export_webp(path)
        print("  webp refreshed")
    print("done")


if __name__ == "__main__":
    main()
