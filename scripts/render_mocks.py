#!/usr/bin/env python3
"""Render mock HTML screens to PNG (+ webp variants) via headless Chrome."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOCKS = ROOT / "mocks"
GEN = ROOT / "images" / "generated"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SCREENS = [
    # id, html, out_rel, width, height
    ("brand-hero-homepage", "brand-hero-homepage.html", "brand/brand-hero-homepage.png", 2560, 1440),
    ("lh-dashboard-manager", "lh-dashboard-manager.html", "leadshunter/lh-dashboard-manager.png", 2560, 1440),
    ("lh-signal-card-s4", "lh-signal-card-s4.html", "leadshunter/lh-signal-card-s4.png", 1024, 1536),
    ("vect-customer-profile", "vect-customer-profile.html", "vect/vect-customer-profile.png", 2560, 1440),
    ("vect-ai-qc-transcript", "vect-ai-qc-transcript.html", "vect/vect-ai-qc-transcript.png", 2560, 1440),
    ("tact-digital-workorder", "tact-digital-workorder.html", "tact/tact-digital-workorder.png", 2560, 1440),
    ("tact-dispatch-cockpit", "tact-dispatch-cockpit.html", "tact/tact-dispatch-cockpit.png", 2560, 1440),
    ("brand-beliefs-principles", "brand-beliefs-principles.html", "brand/brand-beliefs-principles.png", 2560, 1440),
]


def render(html: Path, out: Path, w: int, h: int) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    url = html.resolve().as_uri()
    with tempfile.TemporaryDirectory() as td:
        shot = Path(td) / "shot.png"
        cmd = [
            CHROME,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"--window-size={w},{h}",
            f"--screenshot={shot}",
            url,
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        # Chrome may screenshot slightly larger; crop to exact size with sips
        subprocess.run(
            ["sips", "-z", str(h), str(w), str(shot), "--out", str(out)],
            check=True,
            capture_output=True,
        )
    print("rendered", out.relative_to(ROOT), f"{w}x{h}")


def export_webp(png: Path) -> None:
    from PIL import Image

    stem = png.stem
    parent = png.parent
    im = Image.open(png)
    w, h = im.size

    def cwebp(src: Path, dst: Path, q: int) -> None:
        subprocess.run(
            ["cwebp", "-q", str(q), "-m", "6", str(src), "-o", str(dst)],
            check=True,
            capture_output=True,
        )

    full = parent / f"{stem}.webp"
    cwebp(png, full, 90)

    for tw, q in ((1280, 90), (768, 88)):
        if w <= tw and h <= tw:
            continue
        if w >= h:
            th = max(1, h * tw // w)
            size = (tw, th)
            name = f"{stem}-{tw}.webp"
        else:
            # portrait: emit 1024 and 768 on long side mapped by width targets used in site
            if tw == 1280:
                tw2, th2 = 1024, max(1, h * 1024 // w)
                name = f"{stem}-1024.webp"
                size = (tw2, th2)
            else:
                th = max(1, h * tw // w)
                size = (tw, th)
                name = f"{stem}-{tw}.webp"
        tmp = Path(f"/tmp/lan-render-{stem}-{size[0]}.png")
        im.resize(size, Image.Resampling.LANCZOS).save(tmp)
        cwebp(tmp, parent / name, q)

    # retina master for landscape sources
    if w >= 2560 and h >= 1400:
        cwebp(png, parent / f"{stem}-2560.webp", 88)

    print("  webp ok", stem)


def main() -> None:
    for _id, html_name, out_rel, w, h in SCREENS:
        html = MOCKS / html_name
        out = GEN / out_rel
        render(html, out, w, h)
        export_webp(out)
    print("done")


if __name__ == "__main__":
    main()
