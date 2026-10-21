# HANDOFF — Money Channel, Video 1: Safari ya Bakhresa

Open this file in a new Claude Code session and say:
**"Read this handoff and start Step 1."**

---

## 0. Who I am and what we're building

- **Owner:** runs Vinei TV (126K subs, Swahili tech), Blonxin (English IPTV), and Domosauti.com (his own Swahili TTS and voice-clone product). Based in Tanzania.
- **Working style:** he doesn't film. Videos are AI voice + AI images + editing only. Always show money in **TZS** (USD only in brackets, if at all). Use a normal system font (Roboto or sans), never "AI-looking" fonts.
- **Data rule:** decisions come from real data, not assumptions. Big media houses (Global TV, Wasafi, Millard Ayo, Azam) don't count as proof that a format works for small channels.
- **The project:** a **new Swahili YouTube channel** of business stories plus money education. Research is on the FlowMap board **"💰 PESA & BIASHARA — Ramani ya Channel Mpya"**. FlowMap task #29 is this video, due 2026-10-28.

### Why this niche (research done 21 Oct 2026)
- **RPM, from the owner's own Vinei TV Studio data (same channel, same Tanzanian audience):**
  - Loan apps: $4.77–19.56
  - Money online / Binance / ChatGPT money: $2.75–3.91
  - Phone tech: $0.41–0.69
  - Entertainment: $0.16–0.31
  - **So money topics pay 4–6× tech.** Gossip about celebrities' wealth drops to entertainment RPM, so never do gossip.
- **Demand:** median views/day of the top 20 Swahili search results:
  - "historia ya matajiri tanzania": 274
  - "uwekezaji utt amis": 92
  - "jinsi ya kutajirika": 89
  - "historia ya dangote": 66
  - "historia ya bakhresa": 45
- **Small-channel proof:**
  - Top5 tz: 30.4K subs from 21 videos (392K on "Matajiri Tano Tanzania")
  - Pesa360: 5.9K subs from 8 videos (131K on Mengi)
  - Polimentary (English): 1.25K subs, 6 videos, 121K in 90 days on a Dangote documentary
- **The gap:** searching "historia ya dangote" in Swahili shows English documentaries. "historia ya M-Pesa / Tecno / Vodacom / Azam" has zero Swahili documentaries. "Wicknell Chivayo: Safari ya Umaskini… hadi Utajiri" got 321K in 14 days (39 min).
- **Channel format:**
  - **Engine A:** cinematic business stories, 15–30 min, 2 per week. Traffic comes from browse and suggested.
  - **Engine B:** investing explainers (UTT AMIS, hatifungani, DSE) with real TZS maths, 1 per week. Traffic comes from search.

---

## 1. API keys: how to set them (never paste keys into the chat)

Set them as environment variables **before** starting Claude Code on the PC:

```
# Windows PowerShell (current window)
$env:GEMINI_API_KEY = "..."        # Google AI Studio key (Nano Banana images, optional Gemini TTS)
$env:DOMOSAUTI_API_KEY = "..."     # only if voice comes from the Domosauti API

# macOS / Linux
export GEMINI_API_KEY="..."
export DOMOSAUTI_API_KEY="..."
```

**Instructions for Claude:**
- Read keys only from these environment variables. Never print them, log them or write them into files.
- **Images (Nano Banana 2):** check Google's current Gemini API docs for the exact image model ID and request format **before** calling it. Don't guess the model name. Test with ONE image first and show it to the owner.
- **Voice:** the owner decides at the start which source to use:
  1. **Domosauti API:** the owner provides the endpoint and request format, since it's his own product.
  2. **Gemini TTS:** check the docs for a Swahili-capable voice and test 20 seconds first.
  3. **Manual:** the owner generates the voice himself and drops the audio files in `audio/`.

  Whichever it is, keep **one narrator voice** for the whole channel.

---

## 2. The rules (protect the channel)

1. **Facts:**
   - Every claim in the script comes from the approved fact sheet, with a source link.
   - Anything unconfirmed is marked UNCONFIRMED and either left out or said as "inaripotiwa kuwa…" ("it is reported that…") with the source named.
   - These are **living people**. No rumours, no claims about crimes, health or family that aren't documented by reliable sources.
2. **Visuals:**
   - **NO** photos or video from news outlets or TV (Millard Ayo, Azam TV, Global, BBC, Reuters…). Content ID will catch them, and the owner already had a strike on another channel.
   - **NO** photorealistic AI "photos" of Bakhresa or any real person. AI scenes show places, objects, crowds and hands, or a person seen from behind or in silhouette. If a face is needed, use a **clearly illustrated, stylised** portrait, never a fake photo.
   - **Allowed:**
     - Free-licensed photos (Wikimedia Commons, CC BY / CC BY-SA / public domain). Record each one's author and licence in `credits.txt` and in the description.
     - Archive.org public-domain footage.
     - Company logos and product packaging, shown small and used to identify the company.
     - Motion graphics made by us.
3. **Upload settings:** tick YouTube's "altered or synthetic content" box when realistic AI scenes are used. Not made for kids.
4. **Money and selling:** every number is in TZS. No WhatsApp selling, no loan apps on this channel.
5. **Originality:** every script is written from research, not a template. This is what YouTube's July 2025 "inauthentic content" rule is about.

---

## 3. Video 1 spec

- **Working title:** **Safari ya Bakhresa: Kutoka Kushona Viatu Kariakoo Hadi Bilionea**
  - ⚠️ "Kushona viatu" comes from a Millard Ayo video title. It must be **VERIFIED** before it goes in the title. If it isn't, use: *"Safari ya Bakhresa: Jinsi Mfanyabiashara wa Zanzibar Alivyojenga Himaya ya Azam"*.
- **Length:** 18–22 minutes. Swahili TTS runs at roughly 130 words a minute, so the script is about 2,400–2,800 words.
- **Format:** 1920×1080, 30 fps, H.264 (CRF 20), AAC 192 kbps. Voice peaks at −3 dB. Music sits about −22 dB under the voice.
- **Captions:** Swahili captions burned in, plus a separate `.srt` for upload.

### Story structure (fill only with verified facts)
| Time | Section | Purpose |
|---|---|---|
| 0:00–0:45 | **Cold open** | The empire today (brands, scale) vs. where he started. End on a question that makes people stay. |
| 0:45–4:00 | Act 1: The beginning | Zanzibar / Dar origins, first small business |
| 4:00–8:00 | Act 2: The first big bet | First major business move and the risk he took |
| 8:00–13:00 | Act 3: Building Azam | Flour milling and the Azam brand, expansion into new products |
| 13:00–17:00 | Act 4: The empire | Group companies (to verify: drinks, ice cream, Azam Marine boats, Azam TV, Azam FC, regional expansion) |
| 17:00–20:00 | Act 5: Lessons | 5 business lessons applied to a Tanzanian with small capital, with TZS examples |
| 20:00–end | Outro | One-line summary, a comment question ("Biashara gani ungeanza na laki 5?"), tease video 2 (M-Pesa) |

### Research leads (all UNVERIFIED; find independent sources)
- **Primary source:** "FAHARI YETU - SAID SALIM BAKHRESA INTERVIEW | EPISODE 33" on the official **Bakhresa Group** YouTube channel (75K views). Read its transcript. This is his own account.
- **Documentary:** "Makala maalum ya safari ya maisha ya Mzee Said Salim Bakhresa" (UTV Tanzania / Azam TV).
- **Claim to check:** "Hapa ndipo alipoanzia Bakhresa kushona viatu Kariakoo" (Millard Ayo). This is the origin claim to check.
- **Written sources:** the Bakhresa Group official website (company history, brands, countries), plus Forbes, The Citizen, Daily News and The EastAfrican profiles.
- **Approach:** these sources are for **facts only**. Never use their footage or photos. Prefer numbers from official or company sources, and give years where you can.

---

## 4. Workflow (do the steps in order; stop for approval where it says STOP)

**Step 1: Fact sheet.** Create `fact-sheet.md`: a table of Claim, Source link, Confidence (Confirmed / Reported / Unconfirmed). Include 25–40 facts, with key numbers converted to TZS. **STOP: the owner approves.**

**Step 2: Script.**
- Write `script-sw.txt` in Swahili, as clean TTS text. No brackets or stage directions, numbers written out as words, split into parts of about 2 minutes.
- Write `script-shotlist.md` alongside it: for every 6–10 seconds of narration, list the visual type (`ai-scene` / `cc-photo` / `map` / `number-card` / `timeline` / `headline-recreation` / `logo`) and its prompt or source.
- Hook in the first 30 seconds. One "open loop" per act.

**STOP: the owner approves.**

**Step 3: Pilot (first 3 minutes only).**
1. Voice the cold open plus Act 1.
2. Generate those images: Nano Banana 2, 16:9, cinematic documentary style, warm earthy colours, film grain. No text inside the images, because text is added in the edit. No real faces.
3. Build the motion graphics with Python and Pillow, then render with ffmpeg.
4. Send the pilot MP4. **STOP: the owner judges the quality before the full video.**

**Step 4: Full video.** Voice all the parts, generate the rest of the images (about 120–160 visuals for 20 minutes), render, then produce:
- `final.mp4`
- `final.srt`
- `credits.txt`
- `thumbnail.png`
- `upload.md` (title, description, chapters, tags)

---

## 5. Look and feel (channel style)

- **Palette:** deep charcoal or espresso background, gold accent `#E8B86B`, teal accent `#2FB4A0` for money numbers, cream text `#F5EBDD`. No blue, no purple, no neon green.
- **Font:** Roboto or the system sans-serif, bold for numbers. Number cards show TZS big, for example "TSh 1,000,000,000,000" with the short form under it ("Trilioni 1").
- **Motion:**
  - Slow zoom and pan on every still (about 4% zoom over 6–8 s).
  - Fades of 0.3–0.5 s.
  - Maps animate a route (Zanzibar → Dar es Salaam → region).
  - Timeline bar with the year at the top-left in every act.
- **Intro:** one Veo clip of about 6 s (e.g., a dhow arriving at Zanzibar at sunrise, or a flour mill at night). The owner generates it if Veo isn't available through the API.
- **Music:** calm documentary bed from the YouTube Audio Library (the owner downloads it). Swell slightly at the act changes.

### Thumbnail
- **Background:** a stylised illustration (not a photo) that suggests the journey, e.g. small Kariakoo stall on the left → Azam factory and boat on the right.
- **Text:** a big TZS number or a 3-word hook in yellow `#FFD400` and white, e.g. "KUTOKA SIFURI → BILIONEA". Use at most 4 words.
- **Safety:** no real photo of Bakhresa unless it's a properly licensed image.

---

## 6. Upload pack (`upload.md`)

- **Title:** a keyword first, e.g. "Historia ya Bakhresa: …"
- **Description:** 2-line hook, chapters (only after the render, starting at 0:00), sources list, image credits, and the AI disclosure line: *"Baadhi ya picha zimetengenezwa kwa AI kwa ajili ya kuonyesha matukio."*
- **Tags:** historia ya bakhresa, bakhresa, said salim bakhresa, azam, matajiri tanzania, historia ya matajiri, biashara tanzania, jinsi ya kutajirika
- **Pinned comment:** a question that invites long answers.
- **End screen:** video 2 (M-Pesa), or the subscribe card until video 2 exists.

---

## 7. Next videos (from the board, in order)
2. Historia ya M-Pesa: Simu Iliyobadilisha Pesa Afrika Mashariki
3. Mifuko 6 ya UTT AMIS: Ukiweka Laki 1 Kila Mwezi, Baada ya Miaka 5 Unapata Kiasi Gani? *(Engine B)*
4. Jinsi TECNO Ilivyoiteka Afrika Bila Kujulikana Ulaya
5. Mo Dewji: Siri za Bilionea Mdogo Zaidi Afrika
