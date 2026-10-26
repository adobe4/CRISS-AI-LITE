"""Cut isolated ink drawings out of their white background and tint them to the paper colour.
Usage: python3 cutout.py EL_DIR PUBLIC_CUT_DIR --paper PAPER.png [--full id1,id2] [--fill id1,id2]
 - writes PUBLIC_CUT_DIR/<id>.png (cropped, RGBA) for every element
 - --full: also writes full_<id>.png at half resolution (uncropped) + svg/<id>_bw.png for vectorising (draw-on items)
 - --fill: ids whose enclosed white areas must stay opaque (mirror glass, clock face, lens...)
For a dark (chalk-on-black) channel pass --invert: white lines on black paper."""
import numpy as np, glob, os, argparse
from PIL import Image, ImageFilter
from scipy import ndimage
ap = argparse.ArgumentParser(); ap.add_argument("el"); ap.add_argument("out"); ap.add_argument("--paper", required=True)
ap.add_argument("--full", default=""); ap.add_argument("--fill", default=""); ap.add_argument("--invert", action="store_true"); a = ap.parse_args()
os.makedirs(a.out, exist_ok=True); os.makedirs("svg", exist_ok=True)
paper = np.asarray(Image.open(a.paper).convert("RGB")).astype(float); pc = np.median(paper.reshape(-1, 3), axis=0)
FULL = set(filter(None, a.full.split(","))); FILL = set(filter(None, a.fill.split(",")))
Image.open(a.paper).convert("RGB").resize((1920, 1080), Image.LANCZOS).save(f"{a.out}/paper.jpg", quality=92)
def mask(im, n):
    lum = im.mean(axis=2); lab, _ = ndimage.label(lum > 232)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border)); fg = ndimage.binary_closing(fg, iterations=2)
    if n in FILL: fg = ndimage.binary_fill_holes(fg)
    lab2, k = ndimage.label(fg)
    if k: sizes = ndimage.sum(fg, lab2, range(1, k + 1)); fg = np.isin(lab2, [i + 1 for i, s in enumerate(sizes) if s > 400])
    return fg
def tint(im):
    if a.invert:  # dark channel: black ink becomes light chalk, white becomes the (dark) paper colour
        return pc + (1 - im / 255) * (240 - pc)
    return im / 255 * pc
for f in sorted(glob.glob(f"{a.el}/*.png")):
    n = os.path.basename(f)[:-4]
    if n == "paper": continue
    im = np.asarray(Image.open(f).convert("RGB")).astype(float); fg = mask(im, n)
    al = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    o = Image.fromarray(tint(im).clip(0, 255).astype(np.uint8)).convert("RGBA"); o.putalpha(al); o.crop(o.getbbox()).save(f"{a.out}/{n}.png")
    if n in FULL:
        h = Image.open(f).convert("RGB"); h = h.resize((h.width // 2, h.height // 2), Image.LANCZOS); ih = np.asarray(h).astype(float)
        fh = mask(ih, n); al = Image.fromarray((fh * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
        o = Image.fromarray(tint(ih).clip(0, 255).astype(np.uint8)).convert("RGBA"); o.putalpha(al); o.save(f"{a.out}/full_{n}.png")
        h.convert("L").point(lambda v: 0 if v < 140 else 255).convert("RGB").save(f"svg/{n}_bw.png")
    print("cut", n)
