"""Background removal + one consistent grade for the squad photos.

  pip install "rembg[cpu]" pillow numpy
  python scripts/cutout-players.py        # private-assets/players/<slug>/source.jpg -> cutout.png

Only the background is removed and the exposure/colour is evened out; faces are never altered (no generative
editing). `bib_to_white` in scripts/player-faces.json desaturates the blue bib in Antonio Verrone's photo so it
reads as the white kit: a colour change limited to blue hues, not a repaint.
"""
import json
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance
from scipy import ndimage
from rembg import new_session, remove

import os
DILATE = os.environ.get('DILATE', '5')
roots = [pathlib.Path('private-assets/players'), pathlib.Path('private-assets/staff')]
faces = json.loads(pathlib.Path('scripts/player-faces.json').read_text())
sessions = {}


def session_for(name: str):
    if name not in sessions:
        sessions[name] = new_session(name)
    return sessions[name]



def blue_bib_to_white(rgba: Image.Image) -> Image.Image:
    a = np.array(rgba.convert('RGBA')).astype(np.float32)
    rgb = a[..., :3] / 255.0
    mx, mn = rgb.max(-1), rgb.min(-1)
    delta = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.where(mx == b, 60 * ((r - g) / delta) + 240, 0)
    sat = delta / (mx + 1e-6)
    blue = (mx == b) & (hue > 185) & (hue < 250) & (sat > 0.10) & (mx > 0.35)
    grey = (r + g + b) / 3
    lift = np.clip(grey * 1.12 + 0.04, 0, 1)
    for c in range(3):
        rgb[..., c] = np.where(blue, lift, rgb[..., c])
    a[..., :3] = rgb * 255
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def clean_edges(rgba: Image.Image) -> Image.Image:
    """Remove the dark/light fringe left by matting: drop near-transparent pixels, pull the edge in by one pixel and
    soften it a touch so the cutout sits cleanly on any backdrop."""
    from PIL import ImageFilter
    alpha = rgba.getchannel('A')
    a = np.array(alpha)
    a[a < 12] = 0
    alpha = Image.fromarray(a).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = rgba.copy()
    out.putalpha(alpha)
    return out


def keep_main_person(rgba: Image.Image, fx: float, fy: float) -> Image.Image:
    """Drop bystanders: keep only the region connected (after a small dilation) to the player's face."""
    arr = np.array(rgba)
    solid = arr[..., 3] > 40
    grown = ndimage.binary_dilation(solid, iterations=int(DILATE))
    labels, _ = ndimage.label(grown)
    h, w = solid.shape
    y, x = int(fy * h), int(fx * w)
    # the face point may land on a transparent pixel: take the nearest labelled one
    window = labels[max(0, y - 40):y + 40, max(0, x - 40):x + 40]
    ids = window[window > 0]
    if ids.size == 0:
        return rgba
    keep = labels == np.bincount(ids).argmax()
    arr[..., 3] = np.where(keep & solid, arr[..., 3], 0)
    return Image.fromarray(arr, 'RGBA')


for d in sorted(p for r in roots if r.exists() for p in r.iterdir() if p.is_dir()):
    src = d / 'source.jpg'
    if not src.exists():
        continue
    img = Image.open(src).convert('RGB')
    f0 = faces.get(d.name, {})
    if f0.get('crop'):  # e.g. drop printed lettering below the chest on a poster
        w0, h0 = img.size
        x0, y0, x1, y1 = f0['crop']
        img = img.crop((int(x0 * w0), int(y0 * h0), int(x1 * w0), int(y1 * h0)))
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Color(img).enhance(1.05)
    f = faces.get(d.name, {'x': 0.5, 'y': 0.3})
    out = remove(img, session=session_for(f.get('model', 'u2net_human_seg')), alpha_matting=True,
                 alpha_matting_foreground_threshold=235, alpha_matting_background_threshold=15, alpha_matting_erode_size=12)
    if faces.get(d.name, {}).get('bib_to_white'):
        out = blue_bib_to_white(out)
    out = keep_main_person(out, f['x'], f['y'])
    arr = np.array(out)
    h, w = arr.shape[:2]
    for x0, y0, x1, y1 in f.get('erase', []):  # fractional boxes over leftovers from bystanders
        arr[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w), 3] = 0
    out = Image.fromarray(arr, 'RGBA')
    # polygons in source pixels, for leftovers that follow a real outline
    if f.get('erase_poly'):
        alpha = out.getchannel('A')
        draw = ImageDraw.Draw(alpha)
        for poly in f['erase_poly']:
            draw.polygon([tuple(pt) for pt in poly], fill=0)
        out.putalpha(alpha)
    out = clean_edges(out)
    out.save(d / 'cutout.png')
    print('cutout', d.name)
