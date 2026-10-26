import json,sys,time,urllib.request,urllib.parse
UA={"User-Agent":"CrissAiLite/1.0 (YouTube research; github.com/adobe4)"}
titles=sys.argv[1:]
u="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({"action":"query","titles":"|".join(titles),"prop":"imageinfo","iiprop":"url|size|extmetadata|mediatype","format":"json"})
for a in range(6):
    try: d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30));break
    except Exception: time.sleep(8)
for p in d["query"]["pages"].values():
    ii=p["imageinfo"][0]; m=ii.get("extmetadata",{})
    print(json.dumps({"t":p["title"],"url":ii["url"],"MB":round(ii["size"]/1e6,1),"dur":m.get("Duration",{}).get("value") if False else None,"lic":m.get("LicenseShortName",{}).get("value"),"credit":m.get("Credit",{}).get("value","")[:80]}))
