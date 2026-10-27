import os,sys,json,base64,urllib.request,time
# usage: g.py OUT "prompt" [ar] [ref1.png ref2.png ...]
out,prompt=sys.argv[1],sys.argv[2]; ar=sys.argv[3] if len(sys.argv)>3 else "16:9"; refs=sys.argv[4:]
parts=[]
for r in refs: parts+= [{"inlineData":{"mimeType":"image/png","data":base64.b64encode(open(r,"rb").read()).decode()}}]
parts.append({"text":prompt})
body={"contents":[{"parts":parts}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":ar}}}
for a in range(5):
    try:
        req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":os.environ["GEMINI_API_KEY"]})
        d=json.load(urllib.request.urlopen(req,timeout=300))
        for p in d["candidates"][0]["content"]["parts"]:
            if "inlineData" in p: open(out,"wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok",out); sys.exit(0)
        print("noimg",json.dumps(d)[:200])
    except Exception as e: print("retry",out,str(e)[:80])
    time.sleep(10*(a+1))
print("FAIL",out)
