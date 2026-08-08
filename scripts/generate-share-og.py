#!/usr/bin/env python3
"""Write route share cards as the official white-background LAN logo."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images/generated/share"
LOGO = ROOT / "images/logo/WEB-logo.png"
SIZE = 1000

FILES = [
    "og-home-v2.png",
    "og-leadshunter-v2.png",
    "og-internal-expense-v2.png",
    "og-ai-course-v2.png",
    "og-ai-course-fde-v2.png",
    "og-ai-course-mvp-3day-v2.png",
    "og-wecom-v2.png",
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo = Image.open(LOGO).convert("RGBA")
    # Keep pure white square; center the official mark.
    canvas = Image.new("RGB", (SIZE, SIZE), (255, 255, 255))
    mark = logo.copy()
    mark.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)
    x = (SIZE - mark.width) // 2
    y = (SIZE - mark.height) // 2
    canvas.paste(mark, (x, y), mark if mark.mode == "RGBA" else None)

    for name in FILES:
        out = OUT / name
        canvas.save(out, format="PNG", optimize=True)
        print(out.relative_to(ROOT))


if __name__ == "__main__":
    main()
