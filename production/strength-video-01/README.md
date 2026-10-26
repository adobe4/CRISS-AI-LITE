# Production pipeline: strength channel, video 1

This is reusable for every video on the channel.

1. **Voice:** the owner records the narration (MiniMax / ElevenLabs) as one MP3.
2. **Timing:** run faster-whisper (`small.en`, word timestamps) to get `transcript.json`. Cut any stray lines with ffmpeg, then build `captions.json`.
3. **Shot list:** in `shots.py`, set one image every 4–6 s. Each image is either `B` (woodcut scene) or `D` (blueprint diagram), with on-screen text cards. `CUT_AT`/`CUT_LEN` shift the times after an audio cut.
4. **Images:**
   - Run `GEMINI_API_KEY=... ASSETS_DIR=<dir> python3 genall.py`, where `<dir>` contains:
     - `rook/rook-sheet-1.png`
     - `styletest21/B21-woodcut.png`
     - `styletest21/D21-blueprint.png`
   - Model: `gemini-nano-banana-2.1`.
   - The style and character references are sent with every request.
   - Review contact sheets before rendering.
5. **Render:**
   - Remotion 4: `npx remotion render src/index.ts Video out.mp4 --public-dir=<dir with img/ and narration-clean.mp3> --crf=20`.
   - The edit applies slow zoom/pan on every still, 0.4 s crossfades, copper fact cards, burned-in captions, a vignette, and an end card.

The API key is read from the environment only. Never commit it.
