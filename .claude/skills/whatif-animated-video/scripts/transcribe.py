"""Word-level timings for the narration (faster-whisper small.en). Usage: python3 transcribe.py narration.mp3 transcript.json
Then print words with times to plan every cut/slam/sfx on the beat. ALSO read the transcript for stray lines
(e.g. a section label like 'zero six copy it routine' read aloud) and cut them with ffmpeg aselect."""
import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
segs, _ = m.transcribe(sys.argv[1], word_timestamps=True)
out = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(), "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]} for s in segs]
json.dump(out, open(sys.argv[2], "w"))
print(" ".join(f"{w['w']}@{w['s']:.1f}" for s in out for w in s["words"]))
