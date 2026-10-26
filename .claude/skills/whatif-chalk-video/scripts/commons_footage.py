"""Find + download PUBLIC-DOMAIN video from Wikimedia Commons (US gov / DVIDS footage is public domain).
Usage: python3 commons_footage.py search "ruck march" "Army Combat Fitness Test"
       python3 commons_footage.py get "File:Some video.webm" OUT_DIR/name.webm
Rules learned: Wikimedia rate-limits (HTTP 429) hard. Use a descriptive User-Agent WITHOUT personal email, wait 30-40 s between retries,
download the transcoded 720p.vp9.webm first; if it 404s use 480p.vp9.webm (originals are usually blocked). Check license == Public domain."""
import json, sys, time, urllib.request, urllib.parse, hashlib, os
UA = {"User-Agent": "FacelessResearch/1.0 (YouTube research)"}
def get_json(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except Exception: time.sleep(8 * (i + 1))
    return {}
if sys.argv[1] == "search":
    for q in sys.argv[2:]:
        d = get_json("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "list": "search", "srsearch": q + " filemime:video/webm", "srnamespace": 6, "format": "json", "srlimit": 10}))
        print("==", q); [print("  ", x["title"]) for x in d.get("query", {}).get("search", [])]; time.sleep(4)
elif sys.argv[1] == "get":
    title, out = sys.argv[2], sys.argv[3]
    d = get_json("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|extmetadata", "format": "json"}))
    p = list(d["query"]["pages"].values())[0]; ii = p["imageinfo"][0]; lic = ii["extmetadata"].get("LicenseShortName", {}).get("value")
    print("license:", lic)
    name = title.replace("File:", "").replace(" ", "_"); md5 = hashlib.md5(name.encode()).hexdigest(); q = urllib.parse.quote(name)
    base = f"https://upload.wikimedia.org/wikipedia/commons/transcoded/{md5[0]}/{md5[:2]}/{q}/{q}"
    for v in ["720p.vp9.webm", "480p.vp9.webm"]:
        for i in range(8):
            try:
                data = urllib.request.urlopen(urllib.request.Request(f"{base}.{v}", headers=UA), timeout=300).read()
                open(out, "wb").write(data); print("ok", v, len(data)); sys.exit(0)
            except urllib.error.HTTPError as e:
                print(v, e.code)
                if e.code == 404: break
                time.sleep(35)
    print("FAILED")
