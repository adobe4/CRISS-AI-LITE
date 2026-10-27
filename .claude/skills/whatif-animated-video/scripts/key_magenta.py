# Key a character/prop painted on a flat magenta background into a trimmed transparent PNG.
# usage: python3 key_magenta.py in.png out.png
import sys
import numpy as np
from PIL import Image
im = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
m = np.clip(((np.minimum(r, b) - g) - 40) / 60, 0, 1)  # 1 = pure magenta
out = im.copy()
spill = m > 0.02  # pull magenta fringe back toward neutral
out[..., 0] = np.where(spill, np.minimum(r, g + 40), r)
out[..., 2] = np.where(spill, np.minimum(b, g + 40), b)
img = Image.fromarray(np.dstack([out, (1 - m) * 255]).astype(np.uint8), 'RGBA')
img.crop(img.getbbox()).save(sys.argv[2])
print(sys.argv[2], img.getbbox())
