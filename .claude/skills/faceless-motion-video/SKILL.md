---
name: faceless-motion-video
description: Make a complete faceless YouTube explainer video in the owner's approved "Real Strength / What If" style. The style uses a stock-footage cold open with hard editing, then a paper world where cut-out woodcut drawings move, draw themselves on, and get crossed out, with big straight words and quiet SFX, rendered with Remotion. Use whenever the user wants a new video for the strength channel, the What If channel or a similar faceless channel; asks for "same process as the soldier video"; sends narration audio for a script; or asks for thumbnails for these channels. Also covers the research, script and thumbnail steps.
---

# Faceless motion video (the approved process)

The first video made this way, "Why Soldiers Are Stronger Than Gym Guys", is in `production/strength-video-01/` (v3 is final). The owner called the result "perfect". Reproduce that quality and follow every rule below. Each rule comes from a correction the owner made.

## The owner's non-negotiables (from their feedback)

1. **Not a slideshow.** A full-frame still image with a slow zoom was rejected. Every scene must have things moving in real time: cut-outs sliding, walking, dropping in, climbing; lines drawing themselves; the camera panning between scenes; things crossed out by hand.
2. **Cold open = real stock footage with strong editing.** For the first ~13 s, use fast cuts on the narrator's words, a flash frame on every cut, zoom punches, screen shake on hits, and huge words slamming in. Then a **torn-paper wipe** into the paper world.
3. **Same paper background throughout.** No borders, no frames, no vignette boxes around images.
4. **No yellow or orange.**
   - Strength channel: black ink on cream paper only.
   - Footage: graded black and white with grain, plus paper multiplied on top.
5. **No small words.**
   - No captions, labels or source cards on screen.
   - Only big keyword "slams" (≥ 90 px, mostly 130–260 px, Roboto Black, uppercase).
6. **Every word lands perfectly straight** (rotation 0 at rest). Two-line titles must not tilt in opposite directions.
   - Words stay inside the frame: scene-local x within 90–1830 px.
   - Words never sit on top of a drawing. Check each one with stills.
7. **SFX volume = 5%** (`volume={0.05}`). Use real SFX from Mixkit, never synthesised ones.
8. **Normal system font** (Roboto Black). No "AI fonts".
9. Money in TZS when it's the owner's Swahili channels. These English channels use the units in the script.
10. **Never paste or commit API keys.** Read `GEMINI_API_KEY` from the environment. If the owner pastes a key in chat, use it only in this session's commands and tell them to rotate it.

## Pipeline

### Bundled assets
- `assets/rook-sheet.png`: Rook character reference
- `assets/style-woodcut.png`: woodcut style reference
- `assets/paper.png`: the paper texture

Always reuse these so the channel looks identical every time.

### 0. Setup (fresh session)
`bash .claude/skills/faceless-motion-video/scripts/setup_env.sh`

This installs ffmpeg, faster-whisper, vtracer, scipy and the **system** Roboto Black font. The Remotion project is in the scratchpad: `npm init -y` then install the versions printed by the script. Copy `remotion-template/src/kit.tsx` into `src/`. Chromium is pre-installed at `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.

### 1. Research → idea → script
- **Idea selection:**
  - Use real search demand: the median views per day of the top results. Write it to FlowMap.
  - Use hit/flop pairs analysed by Gemini. The owner runs Gemini prompts; see `scripts/two-new-channels-research-plan.md` Part 6.
- **Formulas that won:**
  - **Strength channel:**
    - One mechanism, never a list.
    - Underdog hook with a hard number in the first 15 s.
    - A timeline (Day 1 → Week 3 → Week 8) with the recurring character **Rook**.
    - Named studies (institution and year).
    - A "Copy-It Routine" plus a self-test ending with "comment your score".
  - **What If channel:**
    - One character, **Milo**, inside the scenario with a time limit ("X happens and YOU have Y minutes").
    - Open on a sensory scene.
    - Plant a detail early that pays off later.
    - Hope → horror → hope.
    - A **Survival Odds** meter.
    - End on a personal question plus a tease of the next episode.
- **Policy (YouTube, July 2026):**
  - No AI persona giving health, medical, finance or legal advice.
  - Strength = training mechanics only.
  - No gore or distress.
  - Source every claim.
  - Max ~3 long videos a week.
  - The About section explains the human-written, AI-assisted process.
- **Voice text rule:** the voice block must contain **no headings or labels**. The owner pastes it whole into MiniMax or ElevenLabs. A pasted label "06-copy-it-routine" was once read aloud as "zero six copy it routine" and had to be cut.
  - Put the voice text between two dashed lines and say "copy only between the lines".
  - Write numbers as words.
- **Length:** 900–1,250 words, which is about 6.5–8 min.

### 2. Audio in → timings
- `python3 scripts/transcribe.py narration.mp3 transcript.json` prints every word with its time.
- **Read it for stray lines.** Cut them with `ffmpeg -af "aselect='not(between(t,A,B))',asetpts=N/SR/TB"`, and shift all later times by the cut length.
- If the recording is missing a line, show it as an on-screen end card instead.

### 3. Assets
- **Character sheet:** generate once per channel and reuse forever. Rook's is `rook-sheet-1.png`: grey tee, dark jeans, black canvas trainers, wristband.
- **Elements:** write a JSON list (`examples/elements-example.json`) of every object and pose the script needs. That's 30–45 per video: people in poses, props, diagrams.
  - Run `GEMINI_API_KEY=… python3 scripts/gen_elements.py elements.json el/ --style STYLE.png --char SHEET.png --char-desc "…"`.
  - Model: `gemini-nano-banana-2.1`. Check the model list first: `GET /v1beta/models`.
  - If an element fails 4 times, rephrase it. The "empty backpack" prompt never worked.
  - **Review a contact sheet** (`scripts/contact_sheet.py out.jpg files…`) and fix wrong poses before using them.
- **Cut-outs:** `python3 scripts/cutout.py el/ public/cut --paper el/paper.png --full a,b --fill mirror,stopwatch`. This flood-fills the white background to alpha and tints the ink to the paper colour.
- **Draw-on vectors:** for the ids in `--full`:
  1. `python3 scripts/vectorize.py ids…`
  2. `SVG_DIR=svg node scripts/prep.mjs ids…` → `src/svg_<id>.json`.

  `DrawSvg` strokes the outlines, then cross-fades to the raster `full_<id>.png`. **Never fill the split vector subpaths**, because they turn into black blobs.
- **Stock footage:** `python3 scripts/commons_footage.py search "…"`, then `get`. Wikimedia Commons US Army (DVIDS) clips are **public domain**.
  - Expect HTTP 429: wait and retry. Use 720p, or 480p if 720p isn't available.
  - **Avoid night clips**; they're too dark after grading.
  - Crop past TV logos (AFN) with `scale` and `transformOrigin`.
  - Use only clips with men for "he" lines.
  - Pick moments from a 1-frame-per-2-3 s contact sheet.
- **SFX:** `bash scripts/mixkit_sfx.sh public/sfx`. That's 22 sounds: impacts, whooshes, a shutter, paper slide, pencil, scribble, pops, tick-tock, heartbeat.

### 4. Build the edit (Remotion)
Use the building blocks in `kit.tsx`:

| Block | What it does |
|---|---|
| `Footage` | Black-and-white grade with paper multiply |
| `Flash` | Flash frame on a cut |
| `Shake` | Screen shake on hits |
| `Slam` | Screen-space big words |
| `WText` | Big words at a world position |
| `Cutout` | Keyframed x/y/scale/rot with optional `walk` bob |
| `Pop` | Spring pop-in or `drop` from above; `out` time |
| `DrawSvg` | Draw-on, then raster |
| `Stroke` | Hand-drawn lines and the cross-out `scribblePath` |
| `Camera` | World pans/zooms between scene keys |
| `Win` | Mount/unmount a scene by time |
| `Footages` | Footage list |
| `Sfx` | SFX list at 5% |
| `Grain` | Film grain |

- Look at `examples/Pilot.tsx` (cold open + first 45 s) and `examples/Rest.tsx` (20 scenes, footage inserts, custom animations). Those animations include the balance scale, gears, rope workers in and out of sync, the graph, gauges, cubes, drifting words, sand and tally marks.
- Scenes sit at x = i·2400 in one world. The camera pans at each scene start with a whoosh.
- Put full-screen footage inserts on top, with a `PaperWipe` back to paper.
- Time **every** slam, pop and SFX to a word from the transcript. Leave no dead air longer than ~2.5 s.

### 5. Check before rendering
- Render 20–50 stills with `COMP=Full node scripts/stills.mjs t1 t2 …` (copy `stills.mjs` into the project) and view them as contact sheets.
- Fix:
  - elements visible before their cue (Cutout/Pop must hide before their first key)
  - words overlapping drawings or the frame edge
  - feet not on the stairs or floor
  - dark footage
  - anything crooked

### 6. Render
`bash scripts/render_chunks.sh Full <frames> /home/user/CRISS-AI-LITE/<Name>.mp4`

This renders 4 chunks plus the audio and joins them. A ~7 min video takes ~1.5–2 h on 4 cores.
- `--concurrency` cannot exceed the core count.
- Short `Slam` windows need monotonic interpolate ranges; that's already handled in the kit.

Spot-check frames from the final file, then send it with `SendUserFile`. `*.mp4` is git-ignored. Commit the source to `production/<channel>-video-NN/`.

### 7. Thumbnails (3 options)
- Generate 3 different concepts with Nano Banana 2.1 at 16:9: scene only, no text, with space left for the headline.
- Add the text with PIL in Roboto Black: max 3–4 words, huge, high contrast, no small words.
- Make a 320×180 preview to check that it still reads at phone size.
- **Concepts that work:**
  - an obvious contrast (small vs big, before vs after)
  - one strong number
  - a character reacting
  - a single striking object

## Brain
FlowMap holds the plans: board 24 "Two New Channels", plus a Brain note "Faceless video process". Update FlowMap after each video with the title, results and lessons.
