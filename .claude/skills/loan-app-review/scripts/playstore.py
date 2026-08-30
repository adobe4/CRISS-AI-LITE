#!/usr/bin/env python3
"""Fetch Google Play app details and reviews, and tag reviews with loan-risk signals.

Subcommands:
  search  <query>              find package ids  (--gl TZ --limit 30)
  app     <pkg|url>            app details as JSON
  reviews <pkg|url>            raw reviews as JSON  (--want 300)
  scan    <pkg|url> [pkg ...]  details + reviews + signal tally per app  (the main one)

Notes learned the hard way:
  * Reviews only come back with hl=en. hl=sw returns an empty list. Reviewers still
    write in Swahili, so you get Swahili text either way - do not "fix" this.
  * The server-side star filter in the reviews RPC is ignored, so filter locally.
"""
import argparse, json, re, sys, time, urllib.parse, urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
RX_RPC = re.compile(r'"wrb\.fr","UsvDTd","((?:[^"\\]|\\.)*)"', re.S)


def _get(url, lang="en"):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": lang})
    return urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")


def pkg_of(s):
    """Accept a package id or any Play Store URL."""
    s = s.strip()
    m = re.search(r"[?&]id=([A-Za-z0-9_.]+)", s)
    return m.group(1) if m else s


# ---------------------------------------------------------------- app details
def _ds_blocks(html):
    out = {}
    for m in re.finditer(r"AF_initDataCallback\((\{.*?\})\);?</script>", html, re.S):
        raw = m.group(1)
        k = re.search(r"key:\s*'(ds:\d+)'", raw)
        d = re.search(r"data:\s*(\[.*\])\s*,\s*sideChannel", raw, re.S)
        if k and d:
            try:
                out[k.group(1)] = json.loads(d.group(1))
            except Exception:
                pass
    return out


def _first(pat, s, default=None, group=1):
    m = re.search(pat, s)
    return m.group(group) if m else default


def app_details(pkg, gl="TZ"):
    """Field positions inside Play's blobs move around, so instead of walking fixed
    index paths we find the one block scoped to this app and pattern-match inside it.
    That block only contains this app, so first-match is safe."""
    pkg = pkg_of(pkg)
    html = _get(f"https://play.google.com/store/apps/details?id={pkg}&hl=en&gl={gl}")
    blocks = _ds_blocks(html)
    title = _first(r'<meta property="og:title" content="([^"]*?)(?: - Apps on Google Play)?"', html)

    detail = rating_blk = None
    for v in blocks.values():
        s = json.dumps(v, ensure_ascii=False)
        if title and title[:18] in s and pkg in s and len(s) > 4000 and detail is None:
            detail = s
        if re.search(r'\[\["(\d\.\d)",\s*[\d.]+\]', s) and pkg in s and len(s) < 4000:
            rating_blk = s

    d = {"package": pkg, "title": title, "url": f"https://play.google.com/store/apps/details?id={pkg}"}
    if detail:
        d["installs"] = _first(r'"(\d[\d,]*\+)"', detail)
        emails = re.findall(r'"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"', detail)
        d["developer_email"] = emails[0] if emails else None
        dates = re.findall(r'"([A-Z][a-z]{2} \d{1,2}, 20\d\d)"', detail)
        if dates:
            import datetime
            parsed = []
            for x in set(dates):
                try:
                    parsed.append((datetime.datetime.strptime(x, "%b %d, %Y"), x))
                except ValueError:
                    pass
            parsed.sort()
            d["released"] = parsed[0][1] if parsed else None
            d["updated"] = parsed[-1][1] if parsed else None
        privacy = [u for u in re.findall(r'"(https?://[^"]{10,120})"', detail) if "privacy" in u.lower()]
        d["privacy_policy"] = privacy[0] if privacy else None
        d["developer"] = _first(r'"([A-Z][A-Za-z0-9 &.,\'-]{3,60} (?:LIMITED|LTD|Limited|Inc|LLC|Company|Co\.?))"', detail)
        d["currency"] = _first(r'"([A-Z]{3})"', detail)
    if rating_blk:
        d["rating"] = float(_first(r'\[\["(\d\.\d)",\s*[\d.]+\]', rating_blk, "0"))
        hist = re.findall(r'\["([\d,]+)",\s*(\d+)\]', rating_blk)
        nums = [int(b) for _, b in hist]
        if len(nums) >= 7:
            d["histogram"] = {"1": nums[0], "2": nums[1], "3": nums[2], "4": nums[3], "5": nums[4]}
            d["total_ratings"], d["total_reviews"] = nums[5], nums[6]
    return d


# -------------------------------------------------------------------- reviews
def _reviews_page(pkg, count, sort, token, gl):
    tok = json.dumps(token) if token else "null"
    inner = f'[null,null,[2,{sort},[{count},null,{tok}]],[{json.dumps(pkg)},7]]'
    url = ("https://play.google.com/_/PlayStoreUi/data/batchexecute"
           f"?rpcids=UsvDTd&hl=en&gl={gl}&source-path=%2Fstore%2Fapps%2Fdetails&hasfast=true&_reqid=1")
    body = urllib.parse.urlencode({"f.req": json.dumps([[["UsvDTd", inner, None, "generic"]]])}).encode()
    req = urllib.request.Request(url, data=body, headers={
        "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    raw = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
    m = RX_RPC.search(raw)
    if not m:
        return [], None
    data = json.loads(json.loads('"' + m.group(1) + '"'))
    items = data[0] if data and isinstance(data[0], list) else []
    out = []
    for r in items:
        if not isinstance(r, list) or len(r) < 6:
            continue
        try:
            out.append({"id": r[0], "author": r[1][0] if r[1] else None, "rating": r[2],
                        "text": r[4] or "", "ts": r[5][0] if r[5] else None,
                        "thumbs": r[6] if len(r) > 6 else 0,
                        "dev_reply": (r[7][1] if len(r) > 7 and r[7] else None),
                        "version": (r[10] if len(r) > 10 else None)})
        except Exception:
            pass
    nxt = None
    try:
        t = data[1]
        nxt = t[1] if isinstance(t, list) and len(t) > 1 and isinstance(t[1], str) else None
    except Exception:
        pass
    return out, nxt


def fetch_reviews(pkg, want=300, gl="TZ", pause=0.35):
    """Pull newest first, then top up with most-relevant, which surfaces the long
    detailed complaints that newest-only tends to bury under one-word ratings."""
    pkg = pkg_of(pkg)
    out, seen = [], set()
    for sort in (2, 1):
        token = None
        while len(out) < want:
            revs, token = _reviews_page(pkg, min(150, want - len(out)), sort, token, gl)
            new = [r for r in revs if r["id"] not in seen]
            for r in new:
                seen.add(r["id"])
            out += new
            if not token or not new:
                break
            time.sleep(pause)
        if len(out) >= want:
            break
    return out


# -------------------------------------------------------------------- signals
SIGNALS = {
    # Ranked roughly by how much harm the behaviour does to a borrower.
    "approved_not_disbursed": r"approved (but|lakini|bila)|umekubaliwa lakini|imekubaliwa lakini|"
                              r"disbursed but|completed order|hela haiingii|pesa haiingii|haijaingia|"
                              r"hakuna pesa (ilio ?ingia|imeingia|iliyoingia)|hamna pesa|sijapokea (pesa|hela)|"
                              r"no money (received|came)|didn'?t receive|sijapata pesa",
    "harassment": r"tishi|kutishia|vitisho|matusi|kunitukana|wanapiga simu|kupigiwa simu|sms za ajabu|"
                  r"meseji za ajabu|sim za kelele|ndugu|jamaa|marafiki|contacts|threat|harass|abuse|insult|"
                  r"shame|blackmail|kuaibisha|kudhalilisha|text (a person|me) a million|kunisumbua|wananidai",
    "paid_but_chased": r"nimelipa.*(nadaiwa|natumiwa|kupigiwa|wananidai)|nimeshalipa|nililipa kabla|"
                       r"already paid|paid but still|nimemaliza kulipa.*bado",
    "high_interest": r"riba (kubwa|juu|nyingi|pekee)|riba ya|interest (is |too |very )?high|expensive|ghali|"
                     r"makato makubwa|processing fee|marejesho makubwa|unyonyaji|wizi|ni wizi",
    "short_term": r"siku (saba|7|14|kumi)|siku \d+|muda mfupi|wiki moja|short (repayment|term)|"
                  r"7 days|14 days|one week|muda mchache",
    "refused_after_data": r"hawajanipa|hawakunipa|hawatoi mkopo|hawajakubali|wamennyima|nimekataliwa|"
                          r"mnanikatalia|hamnipi|reject|denied|declined|took my (id|selfie|data)|"
                          r"wamechukua (selfie|taarifa)",
    "scam_accusation": r"matapeli|utapeli|wizi|waongo|scam|fraud|fake|udanganyifu|wezi|hawaaminiki",
    "support_bad": r"hawajibu|hawapokei|hakuna (msaada|majibu)|no (response|support)|"
                   r"customer (care|service) (is )?(bad|poor)|hawana huduma|sijapata jibu|hawajali|"
                   r"app yenu ipo down",
    "fees_hidden": r"makato|hidden|hawakusema|siri|sikuambiwa|deduct|walikata|ada za|charges",
    "data_privacy": r"taarifa zangu|privacy|wamechukua namba|contacts zangu|picha zangu|"
                    r"personal (data|info)|wanaingilia|selfie yangu",
    "positive_paid": r"nimelipwa|nimepata mkopo|wamenipa|walinipa|received (the )?loan|imesaidia|"
                     r"asante|nzuri sana|inafanya kazi|wanatoa|imenisaidia",
    "app_broken": r"haifunguki|haifanyi kazi|inagoma|error|crash|haipakii|inasumbua|bug|app.*down",
}
# Money in reviews is written every which way: "20,000", "20000", "elfu saba", "laki tatu".
# Catching all three matters because the loan size and the interest are the two numbers
# the audience most wants, and they almost never appear in the store listing.
SW_NUM = {"moja":1,"mbili":2,"tatu":3,"nne":4,"tano":5,"sita":6,"saba":7,"nane":8,"tisa":9,"kumi":10}
RX_TZS = re.compile(r"(?:tsh|tzs|sh)\.?\s?([\d,]{3,12})|\b(\d{1,3},\d{3})\b|\b(\d{4,8})\b", re.I)
RX_SW_MONEY = re.compile(r"\b(elfu|laki|milioni)\s?(\d{1,3}|" + "|".join(SW_NUM) + r")?\b", re.I)
RX_PCT = re.compile(r"(\d{1,3}(?:\.\d+)?)\s?%|asilimia\s?(\d{1,3})", re.I)
RX_DAYS = re.compile(r"siku\s?(\d{1,3})|(\d{1,3})\s?days?|wiki\s?(\d{1,2})", re.I)


def _money(text):
    out = []
    for m in RX_TZS.finditer(text):
        v = (m.group(1) or m.group(2) or m.group(3) or "").replace(",", "")
        if v.isdigit():
            n = int(v)
            if 2019 <= n <= 2030:      # a year, not an amount
                continue
            if 1000 <= n <= 50_000_000:
                out.append(n)
    for m in RX_SW_MONEY.finditer(text):
        unit = {"elfu": 1000, "laki": 100_000, "milioni": 1_000_000}[m.group(1).lower()]
        q = m.group(2)
        mult = 1
        if q:
            mult = int(q) if q.isdigit() else SW_NUM.get(q.lower(), 1)
        out.append(unit * mult)
    return out


def tag(reviews):
    """Count how many reviews carry each signal, and pull the numbers people quote.
    Counting is all this does - reading the quotes and deciding what is true is the
    analyst's job, because reviewers exaggerate and a keyword is not a fact."""
    tally = {k: 0 for k in SIGNALS}
    quotes = {k: [] for k in SIGNALS}
    amounts, pcts, days = [], [], []
    for r in reviews:
        t = r.get("text") or ""
        if not t:
            continue
        for k, pat in SIGNALS.items():
            if re.search(pat, t, re.I):
                tally[k] += 1
                if len(quotes[k]) < 6 and len(t) > 40:
                    quotes[k].append({"rating": r["rating"], "text": t[:400], "thumbs": r.get("thumbs", 0)})
        amounts += _money(t)
        for m in RX_PCT.finditer(t):
            v = m.group(1) or m.group(2)
            if v and 0 < float(v) <= 100:
                pcts.append(float(v))
        for m in RX_DAYS.finditer(t):
            if m.group(3):
                days.append(int(m.group(3)) * 7)
            else:
                v = m.group(1) or m.group(2)
                if v and 1 <= int(v) <= 365:
                    days.append(int(v))
    return {"tally": tally, "quotes": quotes,
            "amounts_mentioned": sorted(amounts)[:60],
            "percents_mentioned": sorted(pcts)[:40],
            "days_mentioned": sorted(days)[:40]}


def suspicion(reviews):
    """Loan apps buy 5-star reviews in bulk. The tell is a wall of very short,
    generic 5-star text. Flagging it stops the rating being taken at face value."""
    five = [r for r in reviews if r["rating"] == 5 and (r.get("text") or "").strip()]
    short5 = [r for r in five if len(r["text"]) < 25]
    low = [r for r in reviews if r["rating"] <= 2]
    with_text = [r for r in reviews if (r.get("text") or "").strip()]
    return {
        "reviews_sampled": len(reviews),
        "with_text": len(with_text),
        "five_star_share": round(len(five) / max(1, len(with_text)), 3),
        "short_generic_5star": len(short5),
        "short_5star_share_of_5star": round(len(short5) / max(1, len(five)), 3),
        "low_star_count": len(low),
        "dev_reply_rate": round(sum(1 for r in reviews if r.get("dev_reply")) / max(1, len(reviews)), 3),
    }


# --------------------------------------------------------------------- search
def search(query, gl="TZ", limit=30):
    html = _get(f"https://play.google.com/store/search?q={urllib.parse.quote(query)}&c=apps&hl=en&gl={gl}")
    seen, out = set(), []
    for m in re.finditer(r"/store/apps/details\?id=([A-Za-z0-9_.]+)", html):
        p = m.group(1)
        if p not in seen:
            seen.add(p)
            out.append(p)
        if len(out) >= limit:
            break
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["search", "app", "reviews", "scan"])
    ap.add_argument("targets", nargs="+")
    ap.add_argument("--want", type=int, default=300, help="reviews per app (default 300)")
    ap.add_argument("--gl", default="TZ")
    ap.add_argument("--limit", type=int, default=30)
    ap.add_argument("--out", help="write JSON here instead of stdout")
    a = ap.parse_args()

    if a.cmd == "search":
        res = search(" ".join(a.targets), a.gl, a.limit)
    elif a.cmd == "app":
        res = [app_details(t, a.gl) for t in a.targets]
    elif a.cmd == "reviews":
        res = {pkg_of(t): fetch_reviews(t, a.want, a.gl) for t in a.targets}
    else:
        res = []
        for t in a.targets:
            p = pkg_of(t)
            try:
                det = app_details(p, a.gl)
                revs = fetch_reviews(p, a.want, a.gl)
                res.append({"details": det, "signals": tag(revs), "integrity": suspicion(revs),
                            "reviews": revs})
                print(f"[ok] {p}: {len(revs)} reviews", file=sys.stderr)
            except Exception as e:
                res.append({"details": {"package": p}, "error": str(e)})
                print(f"[fail] {p}: {e}", file=sys.stderr)
            time.sleep(0.5)
    txt = json.dumps(res, ensure_ascii=False, indent=1)
    if a.out:
        open(a.out, "w", encoding="utf-8").write(txt)
        print(f"wrote {a.out} ({len(txt)} bytes)", file=sys.stderr)
    else:
        print(txt)


if __name__ == "__main__":
    main()
