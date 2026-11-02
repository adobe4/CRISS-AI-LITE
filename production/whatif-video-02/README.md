# What If 02: "You Have 1 Hour Before Falling Into a Black Hole"

The script is in `scripts/whatif-video-02-black-hole-script.md`. The narration is the owner's MiniMax "Magnetic-voiced Male" recording, about 7:12. The stray "day" after "Sun" at 0:15 was silenced.

## Files
- `src/Film2.tsx`: the full edit, timed to `transcript.json`.
- `src/bh.tsx`: new 3D and motion graphics:
  - the lensing black-hole sky (thin-lens equation, photon ring, optional disc, Hawking glow)
  - the ship, drone and station
  - the orbit-drop diagram
  - star streaks, the photon sphere, old-light pulses, "all paths lead to the future", and the stylized spaghettification
- `src/cards.tsx`: the Odds, Chapter, Plate, Grain and LoopMusic components (shared style with video 01).
- `public/art`: painted plates, already colour-corrected to remove blue.
- `art-source/nia_sheet.png`: the reference sheet for the new character Nia (Milo's older sister).
- `gen_all.py`: generates every plate and retries across models. The key comes from `GEMINI_API_KEY`.

**Not in git:** `public/narration.mp3`, `public/music.mp3` (Mixkit "Vastness", asset 184), `public/tex`, `public/sfx2` and `public/grain`.

## Render
```
bash render_film.sh Film2 out/Milo-Black-Hole.mp4 0 2760 4950 7050 9198 11268 13140
```
