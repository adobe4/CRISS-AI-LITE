import json,sys,time,urllib.request,urllib.parse
UA={"User-Agent":"CrissAiLite/1.0 (YouTube research; github.com/adobe4)"}
def get(u):
    for a in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30))
        except Exception as e: time.sleep(6*(a+1))
    return {}
for q in sys.argv[1:]:
    u="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({"action":"query","list":"search","srsearch":q+" filemime:video/webm","srnamespace":6,"format":"json","srlimit":8})
    d=get(u); print("==",q)
    for x in d.get("query",{}).get("search",[]): print("  ",x["title"])
    time.sleep(4)
