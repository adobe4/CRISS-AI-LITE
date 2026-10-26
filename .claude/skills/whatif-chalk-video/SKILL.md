---
name: whatif-chalk-video
description: Make a complete video for the owner's WHAT IF channel. Each video is a science "what if" scenario told as a story with the character Milo and a big Survival Odds meter, in white chalk on a black chalkboard. It opens cold on real NASA/USGS/NOAA public-domain footage with hard editing, then moves into a chalk world where cut-out drawings move, draw themselves on and animate, with big straight words and Mixkit SFX at 5%, rendered with Remotion. Use whenever the user wants a new What If video or script, sends narration audio for a What If script, mentions Milo or Survival Odds, or wants What If thumbnails. For the strength channel (cream paper, Rook) use faceless-motion-video instead.
---

# What If channel: chalk video (the approved process)

**First video:** "The Sun Disappears. You Have 8 Minutes Left" (5:27). The source is in `production/whatif-video-01/` and the full composition is in `examples/Sun.tsx`. Reproduce that look and process.

## Channel identity (never change)
- **Look:** white chalk lines on a black chalkboard (`assets/paper-dark.png`). There is no colour anywhere in the edit. Footage is graded black and white, so even the Sun reads white (no yellow or orange). Thumbnails can use colour for text only if the owner chooses.
- **Character:** **Milo** (`assets/milo-sheet.png`): a slim young man, about 22, with short wavy dark hair, a zip jacket, jeans, canvas sneakers and a small backpack. He lives every scenario.
- **Signature:** the **SURVIVAL ODDS** meter, top-right. It shows a big label (≥ 90 px), a huge % number and a bar. It counts down with a heartbeat hit each time the narrator says the odds. The odds are a story device, never presented as science.
- **Series:** each video ends by teasing the next scenario with Milo, e.g. "Next time, Milo falls into a black hole. He has one hour."

## The owner's rules (from feedback; all apply)
1. **Not a slideshow.** Things move in real time: cut-outs slide, walk, drop and fade; drawings draw themselves; the camera pans between scenes; custom animations (orbits, stars, snow, smoke, meters).
2. **Cold open = real footage with strong editing:** fast cuts on the narrator's words, flash frames, zoom punches, shake, huge words slamming in, hard cuts to black on shock words. Then a **torn chalkboard wipe** into the chalk world.
3. **No small words:** no captions or labels; only big slams (≥ 90 px, Roboto Black, uppercase).
4. **Every word lands perfectly straight** (rotation 0 at rest), stays inside the frame and never covers a drawing or the odds meter. Check this with stills.
5. **SFX from Mixkit at 5%** volume.
6. **Normal system font:** Roboto Black, installed as a system font. Web-font loading stalls the renders.
7. **The voice text has NO headings or labels.** Put it between two dashed lines; the owner pastes only that. Numbers are written as words.
8. **Never paste or commit API keys.** Read `GEMINI_API_KEY` from the environment.

## Script formula (what wins for what-if videos)
- **Title:** "[Event]. You Have [time] Left" or "You Have [time] Before [event]". Personal ("you") plus a hard clock.
- **Choosing a topic:**
  - Pick scenarios with big search demand and old top videos: black hole 4,255/day, last person 2,962, $1B 2,557, sun gone 2,369, ice melts 2,075, everyone gone 2,024, Earth rings 1,957.
  - Avoid near-zero-demand ideas (internet gone, money gone, gravity doubled, bees) and body-horror or medical what-ifs.
- **Structure:**
  1. Open on a sensory moment with Milo, then the event, then the twist.
  2. Physics explained simply, with one analogy (e.g. "a letter still in the mail").
  3. Plant a detail early ("remember the Moon") and pay it off later.
  4. Hope → horror → hope.
  5. Survival Odds drops 3–5 times.
  6. A timeline (minute → day 1 → day 7 → month → year).
  7. A personal question at the end ("where would you go?") and a tease of the next episode.
- Every fact is sourced (Live Science, Popular Science, NASA, Wikipedia for physics). No gore or panic (YouTube's "distressing content" rule).
- 900–1,200 words, about 5.5–8 min.

## Pipeline (scripts are in `scripts/`)
0. **Setup:** `bash scripts/setup_env.sh`, then create a Remotion project (`npm i remotion@4.0.300 @remotion/cli@4.0.300 @remotion/paths@4.0.300 react@18.3.1 react-dom@18.3.1`) and copy `remotion-template/src/kit.tsx`, and run `python3 scripts/make_grain.py public/grain` (the render fails without the grain files). It's already themed: INK `#ECE8DE`, PAPER `#1d1d1c`, footage soft-light overlay at 0.35, flashes in INK.
1. **Narration:** run `python3 scripts/transcribe.py narration.mp3 transcript.json` to get word times. Look for stray lines and cut them (see the strength skill for the ffmpeg cut).
2. **Elements:** list every prop and pose in a JSON file (`examples/elements-example.json`). Generate them as **black ink on white**:
   ```
   GEMINI_API_KEY=… python3 scripts/gen_elements.py elements.json el --style assets/style-woodcut.png --char assets/milo-sheet.png --char-desc "Milo: slim young man about 22, short wavy dark hair, round friendly face, clean-shaven, plain zip-up jacket over a t-shirt, straight jeans, canvas sneakers, small hiking backpack."
   ```
   Then make the cut-outs and **invert them to chalk**:
   ```
   python3 scripts/cutout.py el public/cut --paper assets/paper-dark.png --invert --full <draw-on ids> --fill <ids with enclosed glass/faces>
   ```
   Then `vectorize.py` and `SVG_DIR=../svg node prep.mjs ids…` for draw-on items. **Do not generate solid-black subjects** (a black hole would invert to white). Draw those in SVG; see `BlackHole` in `examples/Sun.tsx`.
3. **Footage:** `python3 scripts/commons_footage.py search …` / `get …`. Use NASA (SDO Sun, ISS Earth, Juno Jupiter), USGS (lava, volcanoes), NOAA and NPS (night skies). These are public domain; check the licence line. Crop away chart panels, captions and logos with `scale` + `origin`. Expect 429s: use 720p, or 480p if 720p isn't available.
4. **SFX:** `bash scripts/mixkit_sfx.sh public/sfx`.
5. **Edit:** copy the structure of `examples/Sun.tsx`:
   - `START` scene times (the camera pans with a whoosh)
   - `World` scenes built with `Win` / `Pop` / `Cutout` / `DrawSvg` / `Stroke` / `WText`
   - the `FOOT` and `FOOT_TEXT` cold open and inserts
   - `WIPES`
   - the `ODDS` list for `OddsMeter`
   - the `SFX` list timed to words

   **Reusable animated pieces** are in that file: SunDraw, Traveler (light dot), Binary (colliding stars + ripples), Orbit (with `leaveAt` for a tangent escape), SkyLight (sky that switches off), StarField, BrightStar, Mercury (thermometer drop), Snow, Ocean (ice lid + waves), Smoke, BlackHole, OddsMeter, PaperWipe, Black (hard black frames).

   **Timing tip:** if a key moment lands right at a scene start, start that scene ~1 s earlier so the camera pan doesn't eat it.
6. **Check:** run `COMP=Full node stills.mjs t…` and review contact sheets (`scripts/contact_sheet.py`). Fix overlaps, words on the meter, elements outside the frame, and anything placed in the wrong scene. A component's x must include `C(i)`.
7. **Render:** `bash scripts/render_chunks.sh Full <frames> /home/user/CRISS-AI-LITE/<Name>.mp4` (about 1–1.5 h for 5–6 min). Spot-check the final file, send it, and commit the source to `production/whatif-video-NN/`.
8. **Thumbnails:** make 3 options at 16:9 in white chalk/engraving on black: a big number or 2–3 word hook, Milo reacting, and one striking object (e.g. an empty dashed Sun). If the owner says they'll add the text, deliver no-text versions. To change one detail of an approved image, **edit that exact image** with Nano Banana (send the image back with "keep everything the same, only…"). Never regenerate a new one.
