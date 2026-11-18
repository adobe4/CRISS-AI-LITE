# HANDOFF: YouTube channels production (read this first)

This file hands work over from a cloud session (last updated Nov 18, 2026) to a new local session. It has everything you need to continue without the old chat.

> **Starting prompt for the new session** (the owner pastes this):
> "Read HANDOFF.md in this repo and follow it. Then continue the current priority."

---

## 0. Instructions for the new agent (follow in order)
1. Check out the work branch and pull:
   `git fetch origin claude/youtube-strategy-content-plan-sqgmdm && git checkout claude/youtube-strategy-content-plan-sqgmdm && git pull`
2. Read, in this order:
   1. this file
   2. `production/in-this-town/hit-formula.md`
   3. `production/in-this-town/research.md`
   4. `scripts/in-this-town-01-lying-turns-you-grey.md`
3. Read the owner's standing rules (section 2). They are not optional; the owner gets angry when they're broken.
4. Continue **section 4: Current priority**.
5. Don't push to any other branch. Commit when a piece of work is done. Never commit secrets (section 3). Don't put AI model names in commits, files or anything published.

The repo itself is the owner's WhatsApp bot (`index.js`, `lib/`, `plugins/`...). **Don't touch the bot code.** All YouTube work lives in `production/`, `scripts/`, `.claude/skills/` and this file.

---

## 1. Who the owner is and their channels
| Channel | Language / topic | Status |
|---|---|---|
| **Vinei TV** | Swahili tech | Running |
| **Blonxin** | English IPTV / streaming. 9.17K subs. Hits: "Ultimate Guide to Streaming in 2026" (146K), "…Streaming Boxes in 2026" (33K) | Running; keeps the IPTV and app side |
| **FINEKALI** | Swahili business | Running |
| **Real Strength** | Fitness, character "Rook", cream-paper style (skill: `faceless-motion-video`) | Running |
| **Milo's Odds** | "What If" science stories, character Milo, Survival Odds meter (skill: `whatif-animated-video`). 2 videos made (Sun, Black Hole) | The owner dropped it as recommendation-dependent and "luck based" |
| **NEW: "In This Town" stories** | English, Roblox-style "In This Town…" Shorts plus weekly long compilations | **CURRENT PRIORITY** |
| NEW (planned): TV & streaming help | Legal TVs, Roku, Fire TV, antennas, settings, for older viewers | Plan ready (30 videos); not started |
| Drive or Tow (car warning lights) | Faceless car channel | **Parked**: the owner saw no views on new videos in this niche |

The owner records narration with **MiniMax, "Magnetic-voiced Male" voice**, from a "VOICE" text we give them, then sends the mp3. We build the video around that audio.

---

## 2. The owner's standing rules (all channels)
- **No small words on screen.** "I hate small words." Labels at least **84 px**, bold, full colour. Big captions.
- **Nothing in the top-left corner** (the YouTube overlay sits there).
- **Very little text on screen:** only meaningful cards.
- **No music.** The owner adds their own. **SFX at volume 0.025, drone beds at 0.02.**
- **VOICE text format:** no labels, no stage directions. Numbers written as words ("three thousand", not 3,000). Put the paste-ready text between two dashed lines.
- **Accurate, sourced facts.** The owner asked for scripts to be "rechecked deeply" several times. Fact-check before you hand over.
- **Colour rules:**
  - What If: no yellow, orange or blue.
  - Car channel: amber, red and green are allowed (they're real warning-light colours).
- **Evidence over guesses.** The owner wants data (vidIQ / YouTube numbers) behind every niche or idea. They say "guarantee hit": give the strongest evidence, but always be honest that nothing is guaranteed.
- **"Think outside the box, not your AI shit":** no generic AI-looking output. Make visuals specifically for each video.
- **The owner can't open .md files in their app.** For anything they need to read, also make a simple **HTML page** (or a PDF or image) they can open.
- **Pronouns:** use they/them for the owner.

---

## 3. Secrets and safety
- **Gemini API key (image generation):** the owner pasted one in the old chat, for that chat only. **It is not in the repo and must never be written to any file or commit.** Ask the owner for it, then pass it only as an environment variable: `GEMINI_API_KEY=... python3 gen_all.py`. Before every commit, run `git diff --cached | grep -E "AIza[0-9A-Za-z_-]{20}|AQ[.][0-9A-Za-z_-]{20}"` and make sure it prints nothing.
- **YouTube policy:**
  - Never re-upload other creators' clips. YouTube's reused-content rule means no Partner Program money, plus copyright strikes.
  - Compilations must be made **only from our own Shorts**.
- **Made for kids:** "In This Town" viewers are largely kids. Write stories that also work for teens and adults, and mark the audience honestly in YouTube Studio.
- **Our own characters:** don't copy Roblox's exact avatars or logo unless the owner decides to animate inside Roblox Studio (see 4.2).

---

## 4. CURRENT PRIORITY: the "In This Town" channel

### 4.1 What's done
- **Research:** `production/in-this-town/research.md` (also published as a page for the owner).
  - "in this town" gets 1.55M searches a month, up 715%.
  - **"in this town roblox compilation" gets 235K a month at competition 27**, up 1,051%, with 36% of searches from the US.
  - Long compilations on small channels (951 to 18K subscribers) get 114K–2.5M views.
- **Hit formula:** `production/in-this-town/hit-formula.md`, studied from 13 top videos (Gneef 28M–36M, R6Rants 6.7M, Akira's Diary 3.6M). **Every script must pass its checklist.** The 10 beats:
  1. The rule in one sentence
  2. "You see," + how it works + the cost
  3. 3–5 funny ways the town adapts
  4. "My name is…": the hero is different
  5. The PLANT (a skill, object or saying)
  6. A loved one in danger
  7. A countdown in numbers
  8. The twist: the rule's exact wording + the plant
  9. The town changes
  10. A button line under 8 words
  - Plus: 2:00–2:45 long, about 3 words a second, first-person kid narrator, sound words ("Crack.", "Knock. Knock."), one arguable loophole left open, one named side character with a funny moment.
- **Short 01 script:** `scripts/in-this-town-01-lying-turns-you-grey.md`: **"Every Lie Turns You Grey 🩶"** (about 315 words, about 1:50), with a beat map, shot plan and upload pack. **Waiting for the owner's voice recording.**
- **Posting plan:**
  - Shorts every day, each linked to the latest compilation with the Short's "related video" setting.
  - One long compilation a week (15–25 min) of our own stories only, titled "In This Town… Roblox Stories Compilation (#1)".
  - Make a "Part 2" within 48 hours of any Short that takes off.
  - Same channel, recurring characters.

### 4.2 Open decision (ask the owner if it's still undecided)
- **Option A: our own blocky 3D characters.** Built in our Remotion + three.js pipeline (`production/whatif-video-02` project, `@remotion/three`). This was the previous recommendation.
- **Option B: animate inside Roblox Studio with real Roblox avatars.** This is how the top channels (Gneef, R6Rants) do it. It needs the owner's Roblox Studio work, or a Roblox-capable workflow on their machine.

### 4.3 Next steps
1. Settle 4.2. If it's Option A, build a **style frame**: Leo (bright orange hair), Mom (half grey) and Grandma as blocky characters in a bright blocky town, vertical 1080×1920. Show stills to the owner before animating.
2. When the owner sends the mp3:
   - Transcribe it with faster-whisper to get word timings.
   - Build the 9:16 Short with **big word-by-word captions** (our version is much bigger than the competitors'), close-ups at emotional beats, rule signs as props, and sound effects at 0.025.
3. Write shorts 02–10 using the formula. Candidate premises are in `research.md`. Never copy an existing video's premise: one idea, "100 words a day", was dropped because Custerk Blox already made it.
4. After about 8–12 Shorts, assemble compilation #1 (15–25 min, 16:9 or 9:16, chapters per story).
5. Optional later: a tutorial video, "How I make In This Town stories with Claude", for adults (better ad pay).

---

## 5. Other plans (parked, ready to resume)
- **TV & streaming help channel:** `production/tv-channel/niche-and-first-10.md` and `production/tv-channel/first-30-videos.md`.
  - 30 videos in 3 waves, all searched topics that people watch on the TV screen.
  - Long videos, 8–12 min, no Shorts.
  - Rules: 100% legal, no IPTV, real screen recordings for tutorials.
  - Stop/go check at video 30.
- **Drive or Tow (car):**
  - `production/drive-or-tow/` (design system `src/car.tsx`, x-ray art, `first-10-videos.md`).
  - Script 01: `scripts/drive-or-tow-01-check-engine-light-flashing.md` and `drive-or-tow-01-VOICE.txt`.
  - The owner parked it.
- **Niche research (11 niches):** `production/niche-research-2026-11.md`.
- **Milo's Odds:**
  - `production/whatif-video-02/` (the black-hole film, `UPLOAD.md`, thumbnails) and `production/whatif-channel/` (channel name, icon, description).
  - Scripts are in `scripts/whatif-video-02-*`.
  - The rendered `Milo-Black-Hole.mp4` sits in the repo root and is git-ignored.

---

## 6. Production pipeline (how videos are built)
- **Remotion project:** `production/whatif-video-02/`
  - `package.json`: remotion 4, @remotion/three, three 0.169, @react-three/fiber 8.
  - `src/`: compositions; `Root.tsx` registers them.
  - `render_film.sh`: chunked, resumable render plus audio, then joins with ffmpeg.
  - `stills.mjs`: preview stills (`COMP=<id> node stills.mjs 1 5 10` renders seconds 1, 5 and 10).
- **Local setup:**
  1. `cd production/whatif-video-02 && npm install && npm i @remotion/bundler @remotion/renderer`
  2. Install ffmpeg.
  3. `pip install pillow opencv-python-headless faster-whisper`.
  4. Fonts: Inter, Roboto Mono, Roboto Black, Barlow Condensed.
- **Local path fixes:**
  - `render_film.sh` and `stills.mjs` point `--browser-executable` at a cloud-only Chrome path (`/opt/pw-browsers/...`). Locally, **remove that flag/option** (Remotion downloads its own browser), or point it at your Chrome.
  - `--gl=swangle` was needed for three.js in the cloud. Locally try `--gl=angle`, or leave it out.
- **Car design system:** `production/drive-or-tow/src/car.tsx` (Cluster, Verdict, Bill, XRay components). Copy it into the Remotion `src/` and register a composition to use it.
- **Images:**
  - `production/whatif-video-02/gen_all.py` calls Gemini image models and retries across `gemini-3.1-flash-image`, `gemini-2.5-flash-image` and `gemini-3-pro-image`. They often return 503, so it retries.
  - The key comes from the env var only.
- **Audio:**
  - Mix with ffmpeg `adelay`/`amix`, which is faster than a Remotion audio render.
  - Silence glitches with a volume ramp, keeping the timing.
- **Delivery:** for big files, re-encode with `-crf 19 -maxrate 9M`.
- **Skills (in `.claude/skills/`):** `whatif-animated-video` (with PLAYBOOK.md and lessons learned), `faceless-motion-video`, `loan-app-review`. **Make a new `in-this-town` skill** once the first Short's workflow is proven.

## 7. Research tools used
- **vidIQ MCP:** keyword research, outliers, transcripts, video data. About 40 add-on credits were left on Nov 18 and the renewable credits reset on Nov 29. Calls cost 5 credits each.
- **FlowMap MCP:** the owner's own app.
  - `niche_report`, `youtube_search` and `youtube_video` use the owner's YouTube API quota.
  - `keyword_ideas` is free.
  - Notes and boards can be saved there.
- If the local session doesn't have these connectors, ask the owner to connect them, or work from the saved research files.

## 8. Git conventions
- **Branch:** `claude/youtube-strategy-content-plan-sqgmdm`. Commit clear messages; push with `git push -u origin claude/youtube-strategy-content-plan-sqgmdm`.
- **Pull requests:** don't open one unless the owner asks.
- **Never commit:** `Milo-Black-Hole.mp4`, narration mp3s or other large media (they're git-ignored), or any API key.
