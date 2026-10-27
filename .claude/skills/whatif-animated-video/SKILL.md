---
name: whatif-animated-video
description: Make a complete video for the owner's WHAT IF channel in the approved studio style. Each video is a science "what if" scenario told as a story with the character Milo (red jacket, curly hair, sage backpack) and a big red Survival Odds meter. The style is fully animated with no real footage. Painted 2D environments with Milo integrated into the scenes are mixed with real-time 3D space shots (Earth, Sun, Moon, Jupiter, orbits, space-time grid, black hole) made with three.js, plus clean editorial typography in bone, black and signal red, all rendered with Remotion. Use whenever the user wants a new What If video or script, sends narration audio for a What If script, mentions Milo or Survival Odds, or wants What If thumbnails. For the strength channel (cream paper, Rook) use faceless-motion-video instead.
---

# What If channel: animated 2D + 3D video (the approved process)

**First video:** "The Sun Disappears. You Have 8 Minutes Left" (5:24). The full edit is in `examples/Film.tsx` and `examples/Opening.tsx`, and the reusable engine is in `template/src/`. Reproduce that look and process.

**History:** the owner rejected each of these styles, so never go back to them:
- chalk on a blackboard ("looks like the gym video", "text like a kid throwing them")
- a stock-footage "mission control" look (blue, light-blue and orange "AI slop colours", common SFX, small words)

The owner's brief for this style: "no real footage, just animated characters… real good looking 2D plus 3D, professional edited, like it was made by a professional studio."

## Channel identity (never change)
- **Palette:**
  - ink `#0B0A09`, bone `#EFE9DF`, signal red `#FF2E3B`, sage `#7D8F6E`, slate `#2E3438`
  - **No yellow, orange or blue anywhere**, including the 3D. Earth textures are recoloured: slate oceans, sage/sand land, bone ice. The Sun is near-white.
- **Milo** (`assets/milo-sheet.png`):
  - Teen or young man with dark curly hair.
  - Red zip jacket, cream tee, charcoal trousers, cream sneakers, sage backpack.
  - Painted storybook style. Always pass the sheet as a reference when generating.
- **Survival Odds:** a red-edged black card on the LEFT, so it never covers Milo. It has the label "Milo's survival odds" (46 px), a 230 px mono % that counts down, and a red bar. Use it 4–6 times, each time the narrator says the odds.
- **Story clock HUD** (top left): a red blinking dot, "SUN OFFLINE" and a `T+ 6D 11:56:42` mono clock. Between chapters it spins fast through time.
- **Chapter cards:** DAY 1 / DAY 7 / MONTH 2 / YEAR 1 in 210 px, with a red rule.
- **End:** a personal question, then a tease of the next Milo episode.

## The owner's rules (from feedback; all apply)
1. **No real footage.** Everything is made: painted plates plus 3D plus typography.
2. **No small words.** Kickers are ≥ 46 px; headlines are 96–230 px.
3. **Words are always straight**, stay inside the frame, and **never sit on the subject.** On 3D shots, use the camera lens shift (`shift={0.2}` on `Rig`) to push the planet right, and put the words on the left with `Side`. On park shots, Milo sits right, so words and the odds card go left. Check every text moment with stills.
4. **SFX at 5% volume. Not stock packs:** the owner hears Mixkit-style SFX as "slop". Use `assets/sfx/`, cut from NASA public-domain mission audio: Quindar tones, sub impact, riser, crackle, drone, whoosh, Geiger. Music sits at about 0.11 and ducks under the big hits.
5. **Fonts:** Inter (800 for headlines, 700 for kickers) and Roboto Mono 700 for numbers, installed as **system fonts**. Never use `delayRender` for fonts; it stalls the renders.
6. **Voice text has NO headings or labels.** Put it between two dashed lines; the owner pastes it whole. Write numbers as words.
7. **Never paste or commit API keys.** Read `GEMINI_API_KEY` from the environment only.

## Script formula
- **Title:** "[Event]. You Have [time] Left" (personal, with a hard clock).
- **Structure:**
  1. A sensory moment with Milo, then the event, then the twist.
  2. Simple physics with one analogy ("a letter still in the mail").
  3. Plant a detail and pay it off ("remember the Moon").
  4. Hope → horror → hope.
  5. Survival Odds drops 4–6 times.
  6. A timeline: minutes → day 1 → day 7 → month → year.
  7. "Where would you go?", then the next-episode tease.
- **Facts:** source every fact (NASA, Live Science, Wikipedia for physics). No gore.
- **Length:** 900–1,200 words, about 5.5–8 min.

## Pipeline
0. **Setup:**
   - Run `bash scripts/setup_env.sh` (fonts, ffmpeg, whisper).
   - Create a Remotion project: `npm i remotion@4.0.300 @remotion/cli@4.0.300 @remotion/three@4.0.300 three@0.169.0 @react-three/fiber@8.17.10 react@18.3.1 react-dom@18.3.1`.
   - Copy `template/src/*` into `src/`, `assets/tex` into `public/tex` and `assets/sfx` into `public/sfx2`.
   - Run `python3 scripts/make_grain.py public/grain`.
1. **Narration:** `python3 scripts/transcribe.py narration.mp3 transcript.json`. Then plan a shot list with absolute seconds for every line (see the `Cut` list in `examples/Film.tsx`).
2. **Painted plates** (Nano Banana): `GEMINI_API_KEY=… python3 scripts/gen_image.py out.png "prompt" 16:9 [refs…]`.
   - **Style line for every prompt:** "painted storybook illustration, cinematic lighting, muted palette of charcoal, bone, sage and deep red, no yellow, no orange, no blue, no text".
   - **Characters in a scene:** generate the scene with Milo (pass `assets/milo-sheet.png`). For pose changes, **edit that exact image** ("keep everything the same, only Milo now …"); never regenerate.
   - **Pose layer:** `scripts/align_extract.py` aligns the variants and pulls Milo out. Swap only a feathered rectangle around his upper body as `patches` in `ParkScene`.
   - **Day → night:** edit the day plate into a night plate (same layout); `next={{src, at, fade}}` cross-cuts them.
   - **Floating props or characters** (a falling Milo, an envelope): generate on flat magenta, then `python3 scripts/key_magenta.py in.png out.png`.
3. **3D shots** (`template/src/shots.tsx`, `shots2.tsx`, built on `space.tsx`):
   - `ShotSunVanish`, `ShotEarth`, `ShotLightTrip` (photon stream with a travel timer), `ShotSpacetime` (grid, gravity well and ripple)
   - `ShotMerger` (two neutron stars inspiral, flash and spiral waves), `ShotOrbit` (dashed orbit, ghost Sun, `leaveAt` for a tangent escape), `ShotSwitch` (the day side goes dark)
   - `ShotMoon`, `ShotJupiter` (lit, then dark at `offAt`), `ShotRogue` (frozen Earth), `ShotEarthHome`, `ShotBlackHole` (full-screen lensing shader with the keyed falling Milo)

   All of them render the WebGL canvas at 720p (`R3`), upscaled to 1080p, so software rendering stays fast.
4. **2D scenes** (`park.tsx`):
   - `PlateScene` / `ParkScene` give a Ken Burns camera at plate-pixel focus and zoom, pose patches, flapping birds, sun glare, scrims and a vignette.
   - `ParkScene` adds a cheap canopy sway (a masked transform). **Never use SVG feTurbulence**: it made the render about 3× slower.
   - `Particles` (snow, motes, bubbles) is in `examples/Film.tsx`.
5. **Typography** (`pro.tsx` plus `examples/Film.tsx`):
   - text: `Lower` (kicker plus headline, bottom-left), `Title` (centred), `Side` (left block for subject-right frames), `Figure` (big mono number)
   - meters: `Odds`, `Temp` (card with a thermometer)
   - structure: `Chapter`, `StoryClock`
   - Every word enters with a mask reveal; nothing rotates.
6. **Sound:** narration; `FilmMusic` (loops one track with a crossfade and ducking); `Sfx` list at 0.05; drone beds under the space shots.
7. **Check:**
   - Run `COMP=Film node scripts/stills.mjs t1 t2 …` (½-scale JPGs in `stills/`).
   - Make contact sheets with `scripts/contact_sheet.py`.
   - Look for words on subjects, the odds card on Milo, dark or unreadable 3D, and wrapped kickers (they use `whiteSpace: nowrap`).
8. **Render:**
   - Run `bash scripts/render_film.sh Film OUT.mp4 <frame cut points…>`, with chunks on scene cuts. It resumes skipped chunks.
   - Speed is about 1–1.5 s per frame on 4 cores with `--gl=swangle`, so expect about 3 h for 5.5 min. Send the first chunk to the owner as soon as it's done.
   - The machine has **no system ffmpeg**; use `npx remotion ffmpeg` (it has no `acrossfade`).
9. **Thumbnails:**
   - 3 options at 16:9 in the painted style: Milo reacting, one striking object (e.g. an empty dashed Sun in a black noon sky) and room for a 2–3 word hook.
   - If the owner says they'll add the text, deliver no-text versions.
   - To change an approved image, edit that exact image.
10. **Commit** the source (not the mp4s) to `production/whatif-video-NN/`.
