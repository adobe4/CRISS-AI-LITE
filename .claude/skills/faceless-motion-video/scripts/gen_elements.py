"""Generate isolated black-ink elements with Nano Banana 2.1.
Usage: GEMINI_API_KEY=... python3 gen_elements.py elements.json OUT_DIR --style STYLE.png [--char CHAR_SHEET.png] [ids...]
elements.json: [{"id":"soldier_walk","ar":"3:4","p":"...subject...","char":true?}]
Key is read from the environment only. Never print or save it."""
import os, json, base64, urllib.request, time, sys, argparse
from concurrent.futures import ThreadPoolExecutor
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("out"); ap.add_argument("--style", required=True)
ap.add_argument("--char"); ap.add_argument("--char-desc", default=""); ap.add_argument("--model", default="gemini-nano-banana-2.1")
ap.add_argument("--ink", default="BLACK INK ONLY on PURE WHITE (#FFFFFF)"); ap.add_argument("ids", nargs="*")
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
STY = b64(a.style); CHAR = b64(a.char) if a.char else None
BASE = ("Vintage woodcut engraving illustration, bold carved lines and cross-hatching, " + a.ink + ", absolutely no colour, no orange, no yellow, no grey wash. "
        "The subject is ISOLATED on a plain pure white background: no scenery, no ground, no floor line, no shadow, no frame, no border, no vignette. "
        "Leave generous white margin on all sides; nothing touches the edges. Copy only the line technique from the style reference image, not its scene or colours. "
        "No text, no letters, no numbers.")
EL = [e for e in json.load(open(a.spec)) if not a.ids or e["id"] in a.ids]
def gen(e):
    out = f"{a.out}/{e['id']}.png"
    if os.path.exists(out): return e["id"], "skip"
    parts = [{"text": "Style reference (line technique only):"}, {"inlineData": {"mimeType": "image/png", "data": STY}}]
    txt = BASE
    if e.get("char") and CHAR:
        parts += [{"text": "Character reference sheet:"}, {"inlineData": {"mimeType": "image/png", "data": CHAR}}]
        txt += " The character must match the reference sheet exactly. " + a.char_desc
    parts.append({"text": txt + " Subject: " + e["p"] + f". Aspect {e.get('ar', '1:1')}."})
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": e.get("ar", "1:1")}}}
    for i in range(4):
        try:
            r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent", data=json.dumps(body).encode(),
                                       headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
            d = json.load(urllib.request.urlopen(r, timeout=240))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p: open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); return e["id"], "ok"
        except Exception: pass
        time.sleep(5 * (i + 1))
    return e["id"], "FAIL (rephrase the prompt and retry)"
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(gen, EL): print(*r, flush=True)
