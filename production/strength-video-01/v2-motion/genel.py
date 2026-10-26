import os,json,base64,urllib.request,time,sys
from concurrent.futures import ThreadPoolExecutor
SP="/tmp/claude-0/-home-user-CRISS-AI-LITE/e5feccee-b17d-5dba-8d02-c7becc28b958/scratchpad"
b64=lambda p: base64.b64encode(open(p,"rb").read()).decode()
STY=b64(f"{SP}/styletest21/B21-woodcut.png"); ROOK=b64(f"{SP}/rook/rook-sheet-1.png")
BASE=("Black ink vintage woodcut engraving illustration, bold carved black lines and cross-hatching, BLACK INK ONLY on PURE WHITE (#FFFFFF), absolutely no colour, no orange, no copper, no grey wash. "
      "The subject is ISOLATED on a plain pure white background: no scenery, no ground, no floor line, no shadow, no frame, no border, no vignette. Leave generous white margin on all sides; nothing touches the edges. "
      "Copy only the line technique from the style reference image, not its scene or colours. No text, no letters, no numbers.")
EL=json.load(open("elements.json"))
def gen(e):
    out=f"el/{e['id']}.png"
    if os.path.exists(out): return e["id"],"skip"
    parts=[{"text":"Style reference (line technique only):"},{"inlineData":{"mimeType":"image/png","data":STY}}]
    txt=BASE
    if e.get("rook"):
        parts+=[{"text":"Character reference for Rook:"},{"inlineData":{"mimeType":"image/png","data":ROOK}}]
        txt+=" The man is Rook from the character reference: lean, short dark messy hair, light stubble, plain t-shirt, dark jeans, canvas trainers, a thin dark wristband on his right wrist. Draw him in black ink only."
    parts.append({"text":txt+" Subject: "+e["p"]+f". Aspect {e.get('ar','1:1')}."})
    body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":e.get("ar","1:1")}}}
    for a in range(4):
        try:
            r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]})
            d=json.load(urllib.request.urlopen(r,timeout=240))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p: open(out,"wb").write(base64.b64decode(p["inlineData"]["data"])); return e["id"],"ok"
        except Exception as ex: err=str(ex)[:100]
        time.sleep(5*(a+1))
    return e["id"],"FAIL"
ids=sys.argv[1:]; EL=[e for e in EL if not ids or e["id"] in ids]
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(gen,EL): print(*r,flush=True)
