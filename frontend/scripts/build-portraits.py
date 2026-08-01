#!/usr/bin/env python3
"""
Builds the landing page's philosopher portraits from Wikimedia Commons sources.

The landing's pinned stage puts a portrait behind each scene. They have to sit on
the dark forest background with no visible edge, which rules out plain
photographs: every source here has a different backdrop (studio black, museum
wall, 1880s vignette). The treatment below normalises them into one set:

  1. crop to the head,
  2. flatten to luminance and normalise exposure,
  3. multiply by a heavily feathered ellipse, crushing the backdrop to black,
  4. take the alpha channel *from the luminance* — so whatever is dark stops
     existing and the lit marble is all that remains,
  5. re-colour shadows to forest and highlights to the theme's sand.

Step 4 is why the sources were chosen for dark backdrops (see SOURCES): against a
light museum wall the wall survives the mask and reads as a glowing halo.

Requires Pillow. Run from `frontend/`:

    python3 scripts/build-portraits.py

Sources — all Public domain or CC0, verified via the Commons API:

  socrates   File:Socrates Louvre.jpg .................. Public domain
             https://commons.wikimedia.org/wiki/File:Socrates_Louvre.jpg
  marcus     File:Head Marcus Aurelius archmus Heraklion.jpg ... CC0, by Jebulon
             https://commons.wikimedia.org/wiki/File:Head_Marcus_Aurelius_archmus_Heraklion.jpg
  seneca     File:Buste de Sénèque.jpg ................. CC0, by Okapi071
             https://commons.wikimedia.org/wiki/File:Buste_de_Sénèque.jpg
  epicurus   File:Epicurus bust2.jpg ................... Public domain,
             by Interstate295revisited at English Wikipedia
             https://commons.wikimedia.org/wiki/File:Epicurus_bust2.jpg
"""

import os
import sys
import urllib.parse
import urllib.request

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "people")
CACHE_DIR = os.path.join(os.path.dirname(__file__), ".portrait-cache")
UA = "quiet-mind-landing/1.0 (portrait build script)"

# The portraits are soft duotones with no fine colour detail, so they survive
# aggressive compression; at 1100px/q82 the four of them came to 1.6MB, which is
# too much to put in front of a first-time visitor.
TARGET_HEIGHT = 950
WEBP_QUALITY = 72

# crop: (left, top, right, bottom) as fractions of the source
# ellipse: (centre x, centre y, radius x, radius y) as fractions of the crop
# alpha_gamma: how hard darks are pushed to transparent. 1.55 suits the marble
#   busts here, which are bright objects on a near-black backdrop. A source with
#   less separation between subject and background — a photographic plate
#   rather than a lit sculpture — would need a gentler curve and a brightness
#   lift to avoid disappearing entirely; alpha_gamma/brightness exist per-source
#   for exactly that case, unused while every SOURCES entry is a bust.
# brightness: multiplier applied before the alpha curve.
SOURCES = {
    "socrates": {
        "title": "File:Socrates Louvre.jpg",
        "crop": (0.09, 0.00, 0.91, 0.62),
        "ellipse": (0.50, 0.50, 0.46, 0.52),
    },
    "marcus": {
        "title": "File:Head Marcus Aurelius archmus Heraklion.jpg",
        "crop": (0.06, 0.00, 0.96, 0.86),
        "ellipse": (0.50, 0.48, 0.44, 0.50),
    },
    "seneca": {
        "title": "File:Buste de Sénèque.jpg",
        "crop": (0.00, 0.00, 1.00, 0.85),
        "ellipse": (0.50, 0.48, 0.46, 0.52),
    },
    "epicurus": {
        "title": "File:Epicurus bust2.jpg",
        # Already near-black behind the bust, so this needs none of the
        # Nietzsche plate's brightness/gamma workarounds — a plain bust crop
        # like the other three.
        "crop": (0.00, 0.00, 1.00, 1.00),
        "ellipse": (0.48, 0.46, 0.48, 0.5),
    },
}


def commons_url(title: str, width: int = 1400) -> str:
    query = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": str(width),
        }
    )
    request = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{query}", headers={"User-Agent": UA}
    )
    import json

    payload = json.load(urllib.request.urlopen(request, timeout=30))
    info = list(payload["query"]["pages"].values())[0]["imageinfo"][0]
    return info.get("thumburl") or info["url"]


def fetch(slug: str, title: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{slug}.src")
    if os.path.exists(path):
        return path
    request = urllib.request.Request(commons_url(title), headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=60) as response:
        open(path, "wb").write(response.read())
    return path


def treat(path: str, crop, ellipse, alpha_gamma: float = 1.55, brightness: float = 1.0) -> Image.Image:
    image = Image.open(path)
    if image.mode == "RGBA":
        # Some Commons PNGs already carry alpha; flatten onto black so the
        # luminance-derived alpha below stays the single source of truth.
        flat = Image.new("RGB", image.size, (0, 0, 0))
        flat.paste(image, (0, 0), image)
        image = flat
    image = image.convert("L")

    width, height = image.size
    left, top, right, bottom = crop
    image = image.crop(
        (int(left * width), int(top * height), int(right * width), int(bottom * height))
    )
    image = ImageOps.autocontrast(image, cutoff=(1, 1))
    if brightness != 1.0:
        image = image.point(lambda v: min(255, int(v * brightness)))
    image = image.resize(
        (int(image.width * TARGET_HEIGHT / image.height), TARGET_HEIGHT), Image.LANCZOS
    )

    width, height = image.size
    cx, cy, rx, ry = ellipse
    vignette = Image.new("L", (width, height), 0)
    ImageDraw.Draw(vignette).ellipse(
        [
            int((cx - rx) * width),
            int((cy - ry) * height),
            int((cx + rx) * width),
            int((cy + ry) * height),
        ],
        fill=255,
    )
    vignette = vignette.filter(
        ImageFilter.GaussianBlur(radius=int(min(width, height) * 0.10))
    )
    luminance = ImageChops.multiply(image, vignette)

    # Gamma on the alpha curve: without it the crushed backdrop lingers as a grey
    # haze around the head instead of disappearing.
    alpha = luminance.point(lambda v: int(255 * ((v / 255) ** alpha_gamma)))
    rgb = ImageOps.colorize(
        luminance, black=(9, 22, 15), mid=(74, 110, 86), white=(232, 227, 198)
    ).convert("RGB")
    rgb.putalpha(alpha)
    return rgb


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    for slug, spec in SOURCES.items():
        source = fetch(slug, spec["title"])
        out = treat(
            source,
            spec["crop"],
            spec["ellipse"],
            alpha_gamma=spec.get("alpha_gamma", 1.55),
            brightness=spec.get("brightness", 1.0),
        )
        target = os.path.join(OUT_DIR, f"{slug}.webp")
        out.save(target, "WEBP", quality=WEBP_QUALITY, method=6)
        print(f"{slug:10s} {out.size[0]}x{out.size[1]}  {os.path.getsize(target)//1024}KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
