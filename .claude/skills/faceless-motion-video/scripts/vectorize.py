"""Vectorise svg/<id>_bw.png -> svg/<id>.svg for draw-on animation. Then run: node prep.mjs id1 id2 (writes src/svg_<id>.json)
Usage: python3 vectorize.py id1 id2 ..."""
import sys, vtracer
for n in sys.argv[1:]:
    vtracer.convert_image_to_svg_py(f"svg/{n}_bw.png", f"svg/{n}.svg", colormode="binary", mode="spline", filter_speckle=6,
                                    corner_threshold=60, length_threshold=4.0, splice_threshold=45, path_precision=2)
    print("svg", n)
