import os,json,base64,urllib.request,time,sys
from concurrent.futures import ThreadPoolExecutor
SP=os.environ.get("ASSETS_DIR",".")
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
ROOK=b64(f"{SP}/rook/rook-sheet-1.png"); STY={"B":b64(f"{SP}/styletest21/B21-woodcut.png"),"D":b64(f"{SP}/styletest21/D21-blueprint.png")}
PRE={"B":"Vintage woodcut engraving illustration: bold black carved lines, cross-hatching, strong contrast, warm off-white aged paper background, ONE accent colour (copper orange) used sparingly as a flat spot colour on the key detail. Copy ONLY the line technique and paper look of the style reference image, never its scene, landscape, trees or composition. Use the copper accent on one small key area only.",
     "D":"Old engineering and anatomy diagram on aged cream paper: precise black ink lines, fine hatching, dotted measurement arrows, blank label lines with no words, ONE accent colour (copper orange) on the key part. Copy ONLY the line technique and paper look of the style reference image, never its scene, landscape, trees or composition. Use the copper accent on one small key area only."}
ROOKTXT=" The character Rook must look exactly like the character reference sheet: lean skinny man about 24, short dark messy hair, light stubble, heather-grey crew-neck t-shirt, dark jeans, black canvas trainers, thin copper-orange wristband on his right wrist."
TAIL=" 16:9 composition, single scene, no text, no letters, no numbers, no labels, no watermark."
def gen(s):
    out=f"img/{s['id']}.png"
    if os.path.exists(out): return s["id"],"skip"
    parts=[{"text":"Style reference image:"},{"inlineData":{"mimeType":"image/png","data":STY[s["mode"]]}}]
    txt=PRE[s["mode"]]
    if s["rook"]:
        parts+= [{"text":"Character reference sheet for Rook:"},{"inlineData":{"mimeType":"image/png","data":ROOK}}]; txt+=ROOKTXT
    parts.append({"text":txt+" Scene: "+s["prompt"]+"."+TAIL})
    body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9"}}}
    for a in range(4):
        try:
            r=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]})
            d=json.load(urllib.request.urlopen(r,timeout=240))
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    open(out,"wb").write(base64.b64decode(p["inlineData"]["data"])); return s["id"],"ok"
            err="noimg"
        except Exception as e: err=str(e)[:120]
        time.sleep(5*(a+1))
    return s["id"],"FAIL "+err
shots=json.load(open("shots.json"))
if len(sys.argv)>1: shots=[s for s in shots if s["id"] in sys.argv[1:]]
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(gen,shots): print(*r,flush=True)
