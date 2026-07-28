#!/usr/bin/env python3
"""Render 4:3 Figma prototypes (not final marketing art)."""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MOCKS = ROOT / "mocks"
OUT = ROOT / "images" / "prototypes"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SCREENS = [
    ("brand-hero-homepage", "proto-brand-hero.html", 1600, 1200),
    ("lh-dashboard-manager", "proto-lh-dashboard.html", 1600, 1200),
    ("lh-signal-card-s4", "proto-lh-s4.html", 900, 1200),
    ("vect-customer-profile", "proto-vect-profile.html", 1600, 1200),
    ("vect-ai-qc-transcript", "proto-vect-qc.html", 1600, 1200),
    ("tact-digital-workorder", "proto-tact-workorder.html", 1600, 1200),
    ("tact-dispatch-cockpit", "proto-tact-cockpit.html", 1600, 1200),
    ("brand-beliefs-principles", "proto-beliefs.html", 1600, 1200),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for sid, html_name, w, h in SCREENS:
        html = MOCKS / html_name
        out = OUT / f"{sid}.png"
        url = html.resolve().as_uri()
        tmp = Path(f"/tmp/proto-{sid}.png")
        subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--force-device-scale-factor=1",
                f"--window-size={w},{h}",
                f"--screenshot={tmp}",
                url,
            ],
            check=True,
            capture_output=True,
        )
        subprocess.run(
            ["sips", "-z", str(h), str(w), str(tmp), "--out", str(out)],
            check=True,
            capture_output=True,
        )
        print("proto", out.relative_to(ROOT), f"{w}x{h}")
    print("done")


if __name__ == "__main__":
    main()
