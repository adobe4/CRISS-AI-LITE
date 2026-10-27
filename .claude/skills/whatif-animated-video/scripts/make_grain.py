"""Create the 6 film-grain overlays kit.tsx's <Grain> needs. Usage: python3 make_grain.py public/grain
Without them the full render fails with 'Error loading image ... grain/g0.png'."""
import sys, os, numpy as np
from PIL import Image
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for i in range(6):
    n = np.random.default_rng(i).normal(0, 1, (540, 960))
    a = np.clip(np.abs(n) * 28, 0, 90).astype(np.uint8); v = np.where(n > 0, 255, 0).astype(np.uint8)
    Image.fromarray(np.dstack([v, v, v, a]), "RGBA").save(f"{out}/g{i}.png")
print("grain ok")
