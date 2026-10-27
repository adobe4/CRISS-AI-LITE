# WHAT IF channel: animated video playbook (for any AI agent or editor)

This file is self-contained. Any coding agent (Claude, ChatGPT/Codex, Gemini, Cursor, Copilot…) or a human editor can follow it to make a What If video in the approved style. It needs no tool or feature specific to one AI. Everything it refers to sits in this folder:

```
whatif-animated-video/
  PLAYBOOK.md          ← this file (agent-neutral)
  SKILL.md             ← the same process in Claude Code skill format
  template/src/        ← reusable engine: space.tsx (3D bodies), shots.tsx + shots2.tsx (3D shots),
                          park.tsx (painted 2D scenes), pro.tsx (text, sound helpers), index.ts
  examples/            ← the finished film "The Sun Disappears": Film.tsx, Opening.tsx, Root.tsx
  assets/milo-sheet.png  ← the character reference (always attach it to image prompts)
  assets/tex/          ← recoloured Earth/Moon textures (no blue)
  assets/sfx/          ← sound effects cut from NASA public-domain audio
  scripts/             ← gen_image.py, key_magenta.py, align_extract.py, transcribe.py,
                          make_grain.py, stills.mjs, contact_sheet.py, render_film.sh, setup_env.sh
```

The finished reference video is "The Sun Disappears. You Have 8 Minutes Left" (5:24, 1080p). Watch it before starting, if you can, and copy its rhythm.

---

## 1. What the video must look like

**In one sentence:** a fully animated short film. Painted storybook 2D scenes with the character Milo inside them are intercut with real-time 3D space shots, cut to a narrator, with almost no text.

| Element | Spec |
|---|---|
| Footage | **None.** Every frame is made: painted plates, 3D renders, typography. |
| Palette | ink `#0B0A09`, bone `#EFE9DF`, signal red `#FF2E3B`, sage `#7D8F6E`, slate `#2E3438`. **Never yellow, orange or blue**, not even the sky or the oceans. |
| Character | **Milo:** a young man with dark curly hair. He wears a red zip jacket, cream tee, charcoal trousers, cream sneakers and a sage backpack. Always use `assets/milo-sheet.png` as the reference. |
| 2D | Painted plates (1376×768, 16:9). The camera slowly pushes or pans (Ken Burns). Milo changes pose through swapped "patches". Canopy sway, birds, snow, motes and bubbles add life. |
| 3D | three.js through @remotion/three: Earth (clouds, night side, frost), Sun, Moon, Jupiter, orbits, space-time grid, neutron-star merger, black hole with lensing. |
| Text | **Rare.** Only: the Survival Odds card, chapter cards (DAY 1 / DAY 7 / MONTH 2 / YEAR 1), at most 2 big-number cards (e.g. temperature), and the end "Next time" tease. |
| Fonts | Inter 800/700 for words and Roboto Mono 700 for numbers, installed as **system fonts**. |
| Sound | Narration at 1.0. One music bed at about 0.11 that ducks under hits. SFX at **0.05**, from `assets/sfx` only. |

## 2. The owner's rules (non-negotiable; each one came from a rejection)
1. **Too much text is the #1 complaint.** Never caption the narration and never repeat what the voice says. If you aren't sure whether a text belongs, leave it out.
2. **Nothing in the top-left corner, ever.** No clocks, "LIVE"/status labels, HUDs or logos.
3. No small words. Labels are ≥ 46 px at 1080p; numbers 130–230 px.
4. Words are perfectly straight (no rotation, no bouncy "thrown" text), stay inside the frame and **never cover the subject** (Milo, a planet). On 3D shots, push the planet right with the lens shift and put any card on the left. On park shots Milo sits right, so cards go bottom-left.
5. No "AI slop" colours (blue, light blue, orange, neon gradients) and no common stock SFX packs (Mixkit-style whooshes and dings).
6. Not a slideshow: every shot moves (camera, character, particles, light).
7. The narration text you give the owner has **no labels or headings**. They paste it whole into a voice tool. Write numbers as words.
8. **Never write an API key into a file, commit or message.** Read it from the `GEMINI_API_KEY` environment variable.
9. **Styles already rejected; don't go back to them:** chalk on a blackboard, cream-paper cut-outs (that belongs to the other channel), stock footage with HUD overlays.

## 3. Story formula (script)
- **Title:** "[Event]. You Have [time] Left" (personal, with a clock).
- **Arc:**
  1. Milo in an ordinary sensory moment, then the event, then the twist.
  2. Simple physics with one everyday analogy.
  3. Plant a detail early and pay it off.
  4. A timeline: minutes → day 1 → day 7 → month 2 → year 1.
  5. Survival Odds drops 4–6 times (100 → 90 → 70 → 40 → 5).
  6. Hope → horror → hope.
  7. "Where would you go?", then tease the next Milo episode.
- **Length:** 900–1,200 words (5.5–8 min).
- **Facts:** source every fact. No gore.

## 4. Production steps

### 4.0 Environment
- Node 18+, Python 3.10+, Chromium (or Remotion's own), 4+ CPU cores. A GPU is optional: it renders in software WebGL.
- Run `bash scripts/setup_env.sh`. It installs the fonts as system fonts plus faster-whisper and ffmpeg.
- Then:
  ```
  mkdir film && cd film && npm init -y
  npm i remotion@4.0.300 @remotion/cli@4.0.300 @remotion/three@4.0.300 three@0.169.0 @react-three/fiber@8.17.10 react@18.3.1 react-dom@18.3.1
  mkdir -p src public && cp ../template/src/* src/ && cp ../examples/Root.tsx src/
  cp -r ../assets/tex public/tex && cp -r ../assets/sfx public/sfx2
  python3 ../scripts/make_grain.py public/grain      # REQUIRED, the render fails without it
  ```
- Put `narration.mp3` and `music.mp3` in `public/`.

### 4.1 Timing
Run `python3 scripts/transcribe.py public/narration.mp3 transcript.json`. Print the segments with their start times and write a **shot list**: one row per narration line, with absolute seconds, the shot type and the plate or 3D shot. Cut on sentence starts; most shots last 2–12 s.

### 4.2 Painted plates (image model: Google "Nano Banana", via `scripts/gen_image.py`)
```
GEMINI_API_KEY=$KEY python3 scripts/gen_image.py out.png "<prompt>" 16:9 [reference images…]
```
- **End every prompt with:** `painted storybook illustration, cinematic lighting, muted palette of charcoal, bone white, sage green and deep red only, absolutely no yellow, no orange, no blue, no text`.
- **Scenes with Milo:** pass `assets/milo-sheet.png` (and the location plate, if it exists) as references.
- **Changing a pose, time of day or weather:** **edit the existing plate**, sending it back with "Keep everything exactly the same, only …". Never regenerate a new image; the layout must match for crossfades and patches.
- **Pose patches:** run `python3 scripts/align_extract.py EMPTY.png WITH_MILO.png outdir variant1.png …`. Then crop a feathered rectangle around Milo's upper body from each aligned variant onto a transparent full-size PNG, and swap it in over time.
- **Floating props or characters** (a falling Milo, a letter): generate them on a flat magenta (#FF00FF) background, then run `python3 scripts/key_magenta.py in.png out.png`.

**The plates in the reference film:** park day (Milo eating) / bite / look-up / night (shocked) / night empty / frozen, observatory, LIGO detector, sleeping birds, plant healthy → wilted, old oak at night, deer in a dark forest, snowy tropical beach, cracked ocean ice, an ocean cutaway with an ice lid, hydrothermal vents, a shelter by a volcano with Milo, and a lamp-lit greenhouse with Milo.

### 4.3 Building the edit (Remotion, React)
Copy `examples/Film.tsx`. The structure:
```tsx
<Cut a={67.7} b={72.0}><ParkScene plate="art/park_milo_eat.png" dur={4.3} birds
   patches={[{src: 'art/park_milo_bite_patch.png', from: 0.5, to: 1.6}]}
   cam={{from: {x: 900, y: 400, z: 1.2}, to: {x: 960, y: 400, z: 1.38}}} /></Cut>
<Cut a={72.0} b={75.7}><ShotMoon offAt={99} dur={3.7} /></Cut>
<Odds at={69.3} out={72.0} from={100} to={100} />
```
- `Cut a b`: absolute seconds in the film.
- **Times inside a shot are local** (from 0).

**2D (`park.tsx`):**
- `PlateScene({plate, dur, cam:{from:{x,y,z},to}, patches, birds, night, next:{src,at,fade}})`: x and y are pixel focus points on the 1376×768 plate; z is the zoom (1 = full width).
- `ParkScene` is the same, plus canopy sway (needs `art/canopy_alpha.png`, a white-on-black mask of the tree canopy).
- `Particles kind="snow"|"motes"|"bubbles"` is in `Film.tsx`.

**3D (`shots.tsx`, `shots2.tsx`):**

| Shot | Props |
|---|---|
| `ShotSunVanish` | `vanishAt` |
| `ShotEarth` | `from`, `to`, `look`, `dur`, `withMoon` |
| `ShotLightTrip` | `sunOffAt`, `dur` |
| `ShotSpacetime` | `vanishAt`, `dur` |
| `ShotMerger` | `mergeAt`, `dur` |
| `ShotOrbit` | `dur`, `sunOn`, `leaveAt`, `camFrom`, `camTo` |
| `ShotSwitch` | `offAt`, `dur` |
| `ShotMoon` | `offAt`, `dur` |
| `ShotJupiter` | `offAt`, `dur` |
| `ShotRogue` | `dur` |
| `ShotEarthHome` | `dur` |
| `ShotBlackHole` | `dur`, `miloFrom` |

- All 3D renders at 720p internally (`R3 = 2/3`) and is upscaled, which keeps software rendering fast.
- `Rig shift={0.2}` is a lens shift: the planet moves right and the left side stays free.
- **New 3D bodies:** build them from `space.tsx` (`Earth`, `Sun`, `Moon`, `Jupiter`, `Stars`, the `NOISE` GLSL).

**Cards (`Film.tsx`):**
- `Odds at out from to` (bottom-left)
- `Chapter at label` (1.5 s on full black, between scenes)
- `Temp at out from to label`
- `Lower kicker head at out` (for the end tease only)

**Sound:**
- `<Audio src="narration.mp3"/>`
- `FilmMusic duck={[[a,b],…]}`
- `Sfx list={[[seconds,'sub_impact'],…]}` at 0.05
- drone beds under the space shots

**SFX vocabulary:** `quindar_in`/`quindar_out` (chapter or radio beats), `sub_impact` (each light going out), `riser` (before a reveal), `crackle`, `whoosh_real` (a big cut), `geiger` (each odds drop), `space_drone` (bed).

**Finish:** a film-grain overlay (`grain/g0..5.png` at 0.22 overlay) and a vignette.

### 4.4 Quality check (do it before every full render)
- **Render stills:** `COMP=Film node scripts/stills.mjs 47 70 85 128 165 214 300 316`. Make a contact sheet: `python3 scripts/contact_sheet.py sheet.jpg stills/*.jpg`.
- **Checklist:**
  - [ ] nothing in the top-left corner
  - [ ] text only in the four allowed cases
  - [ ] no card on Milo or on a planet
  - [ ] every 3D shot is readable (not black)
  - [ ] no blue, orange or yellow
  - [ ] each shot moves
  - [ ] the odds match the narration
  - [ ] cuts land on sentence starts

### 4.5 Render
```
bash scripts/render_film.sh Film OUT.mp4 0 1359 3213 4890 6753 8331 9720
```
- The numbers are frame cut points (30 fps), placed on scene cuts.
- It renders chunks with `--gl=swangle` (software WebGL), renders the audio separately, then joins them. Re-running it skips finished chunks.
- **Expect about 1 s per frame on 4 cores.** Run it detached (`nohup setsid … &`) if your agent's shell has a time limit.
- **No system ffmpeg?** Use `npx remotion ffmpeg …`.

**Known pitfalls:**
- SVG `feTurbulence` filters triple the render time; use transforms.
- Web-font loading via `delayRender` stalls renders; use system fonts.
- A missing `public/grain` fails the render.
- Running WebGL in full 1080p is 2× slower.

## 5. Thumbnails
- Make 3 options at 1920×1080 (JPG under 2 MB), same painted style, **no text** unless the owner asks (they add their own). Leave dark empty space for a 2–3 word hook.
- **Proven compositions** (the prompts for video 1):
  - **A, empty sun at noon:** the park bench, a pitch-black starry sky at noon, Milo large on the right half with the sandwich halfway to his mouth, staring up in shock, and a thin dashed bone-white circle where the Sun was, in the upper left.
  - **B, split day / frozen:** a hard vertical seam. The left half is a sunny park, the right half the same park frozen at night. Milo sits on the seam, half lit and half frosted.
  - **C, shock close-up:** Milo's face fills the left side, terrified, lit by a fading white light, with a tiny shrinking sun and a dashed ring in a black sky. The right 40% stays empty.
- **References:** always pass `assets/milo-sheet.png` (plus the park plate for A and B).
- **Fixing an approved thumbnail:** edit that same image ("keep everything the same, only …").

## 6. Delivery
- Send the mp4 (H.264 + AAC, 1080p30) and the 3 thumbnails.
- Commit the sources (`src/`, plates) to `production/whatif-video-NN/` and never the mp4s or keys.
- Then record what the owner liked or rejected in this file, so the next video starts smarter.
