# The Sun Disappears: animated 2D + 3D edit

This is the source of the approved studio-style What If video. The process is described in `.claude/skills/whatif-animated-video/SKILL.md`.

- `src/Film.tsx`: the full 5:24 edit (it uses `Opening.tsx` for 0–45.3 s).
- `public/art`: painted plates, Milo pose patches and keyed props.
- **Not in git:**
  - `public/tex` and `public/sfx2`: copy them from the skill's `assets/`.
  - `public/narration.mp3`, `public/music.mp3` and `public/grain` (`make_grain.py`).
- **Render:** `bash ../../../.claude/skills/whatif-animated-video/scripts/render_film.sh Film OUT.mp4 0 1359 3213 4890 6753 8331 9720`.
