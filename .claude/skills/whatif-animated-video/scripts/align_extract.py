"""Align edited variants of a painted plate to the base plate, then extract the character as its own RGBA layer.
Usage: python3 align_extract.py BASE_EMPTY.png REF_WITH_CHAR.png OUTDIR variant1.png variant2.png ...
 - every variant is warped (ECC, affine) onto REF's pixel grid -> OUTDIR/<name>_aligned.png
 - char layer = pixels that differ from BASE_EMPTY (after aligning BASE_EMPTY too) -> OUTDIR/<name>_char.png
"""
import sys, os, cv2, numpy as np
base_p, ref_p, out = sys.argv[1], sys.argv[2], sys.argv[3]; vars_ = sys.argv[4:]
os.makedirs(out, exist_ok=True)
ref = cv2.imread(ref_p); H, W = ref.shape[:2]
def align(img):
    img = cv2.resize(img, (W, H))
    a = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255; b = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    s = 0.5; a2 = cv2.resize(a, None, fx=s, fy=s); b2 = cv2.resize(b, None, fx=s, fy=s)
    M = np.eye(2, 3, dtype=np.float32)
    try:
        _, M = cv2.findTransformECC(a2, b2, M, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
        M[:, 2] /= s
    except cv2.error as e: print("ECC failed, identity", e)
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT), M
base, Mb = align(cv2.imread(base_p)); cv2.imwrite(f"{out}/base_aligned.png", base); print("base", Mb.round(4).tolist())
for v in [ref_p] + vars_:
    n = os.path.splitext(os.path.basename(v))[0]
    img, M = (ref, None) if v == ref_p else align(cv2.imread(v))
    if v != ref_p: cv2.imwrite(f"{out}/{n}_aligned.png", img); print(n, M.round(4).tolist())
    d = cv2.absdiff(cv2.GaussianBlur(img, (5, 5), 0), cv2.GaussianBlur(base, (5, 5), 0)).sum(2).astype(np.float32)
    m = (d > 55).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    nlab, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if nlab > 1:
        big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = (lab == big).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE); m2 = np.zeros_like(m); cv2.drawContours(m2, cnts, -1, 1, -1)
    m2 = cv2.dilate(m2, np.ones((5, 5), np.uint8))
    alpha = cv2.GaussianBlur(m2.astype(np.float32), (7, 7), 0)
    rgba = np.dstack([img, (alpha * 255).astype(np.uint8)]); cv2.imwrite(f"{out}/{n}_char.png", rgba)
    x, y, w, h = cv2.boundingRect(m2); print(n, "char bbox", x, y, w, h)
