# Generate all plates for video 02, retrying across models until each succeeds. Key from GEMINI_API_KEY env only.
import os, sys, json, base64, urllib.request, time
MODELS = ["gemini-nano-banana-2.1", "gemini-3.1-flash-image", "gemini-2.5-flash-image", "gemini-3-pro-image"]
STYLE = ("painted storybook illustration, cinematic lighting, muted palette of charcoal, bone white, sage green and deep red only, "
         "absolutely no yellow, no orange, no blue, no text, no letters, no logos")
KEEP = "Keep everything exactly the same: same room, same camera, same lighting, same character design. Only change this: "
J = [
 ("nia_sheet", "The first image is Milo (style and family reference); the second shows the painted style to match. Create a character turnaround sheet for NIA, Milo's older sister, about 28: same warm brown skin tone and family resemblance, dark curly hair pulled back into a short practical bun with a few loose curls, calm intelligent eyes, a slim flight-controller headset with a small mic, a sage green flight jacket with thin deep red trim and a small round patch, cream undershirt, charcoal trousers, dark boots. Show full body front view, three-quarter view, side profile, and three head close-ups (focused, worried, heartbroken holding back tears). Clean neutral light grey background, no text, no labels. " + STYLE, ["milo_sheet.png", "greenhouse_milo.png"]),
 ("cockpit_milo", "The first image is Milo (character reference); the second shows the painted style. Inside a small cramped research spaceship cockpit, dark, every screen dead, a single deep red emergency beacon light glowing on the ceiling, Milo strapped loosely into the pilot seat seen from the side in three-quarter view, a pen and a cup floating in zero gravity. Through the large front window: a huge perfectly black circle surrounded by a thin glowing ring of bent starlight, stars smeared and warped around it, dense starfield. Milo sits in the right third of the frame. " + STYLE, ["milo_sheet.png", "greenhouse_milo.png"]),
 ("station_ext", "The image shows the painted style to match. A ring-shaped research space station orbiting in deep space, bone-white hull with small deep red marker lights, seen at a dramatic angle; far behind it a huge black hole: a perfect black circle with a thin bright ring of bent starlight around it, dense galactic-center starfield. Wide cinematic shot. " + STYLE, ["greenhouse_milo.png"]),
 ("control_nia", "The first image is Nia (character reference sheet); the second shows the painted style. Inside the dark control room of a space station: Nia stands at a curved console wearing her headset, her face lit by the screens, three-quarter view, on the left third of the frame. The big main screen in front of her shows a tiny spaceship falling toward a black circle with a small red blinking marker. " + STYLE, ["nia_sheet.png", "greenhouse_milo.png"]),
 ("nia_screen", "The first image is Nia (reference). Close-up of a space station monitor screen in a dark room: on the screen a small spaceship frozen at the very edge of a perfectly black circle, the ship tinted deep red and faint, with a small red blinking beacon dot; Nia's face faintly reflected in the glass, sad. " + STYLE, ["nia_sheet.png"]),
 ("flashback", "The first image is Milo, the second is Nia (references). A warm flashback: Milo and Nia sit together at a big round window on a space station, laughing, sharing food from a tray, the galaxy glowing softly behind them, soft warm bone-white light, cosy. " + STYLE, ["milo_sheet.png", "nia_sheet.png"]),
 ("empty_city", "The image is Milo (reference). An empty city street at dawn, no people anywhere, abandoned cars, papers blowing, Milo standing alone in the middle of the road looking around, small in the frame, wide shot. " + STYLE, ["milo_sheet.png"]),
 # edits of approved bases
 ("cockpit_tap", KEEP + "Milo now leans forward, tapping a dead control panel, frustrated.", ["cockpit_milo.png", "milo_sheet.png"]),
 ("cockpit_float", KEEP + "Milo has unbuckled and floats weightless above the seat, relaxed and amazed, arms slightly out, small objects drifting around him.", ["cockpit_milo.png", "milo_sheet.png"]),
 ("cockpit_listen", KEEP + "Milo presses a small receiver earpiece to his ear, eyes closed, heartbroken, listening. He cannot reply.", ["cockpit_milo.png", "milo_sheet.png"]),
 ("cockpit_lookback", KEEP + "Milo turns to look back over his shoulder at a small rear window full of stars bent and squeezed together; his face is calm.", ["cockpit_milo.png", "milo_sheet.png"]),
 ("cockpit_record", KEEP + "the front window now shows only total blackness, and Milo holds a small handheld voice recorder close to his mouth, speaking softly, calm and tearful.", ["cockpit_milo.png", "milo_sheet.png"]),
 ("nia_close", KEEP + "a closer framing on Nia's face and shoulders, worried, speaking into her headset microphone, screen light on her face.", ["control_nia.png", "nia_sheet.png"]),
 ("nia_recall", KEEP + "Nia's hand pulls a large recall lever on the console, her eyes closed, heartbroken, a tear on her cheek.", ["control_nia.png", "nia_sheet.png"]),
]
def call(model, out, prompt, refs, ar="16:9"):
    parts = [{"inlineData": {"mimeType": "image/png", "data": base64.b64encode(open(r, "rb").read()).decode()}} for r in refs]
    parts.append({"text": prompt})
    body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    d = json.load(urllib.request.urlopen(req, timeout=300))
    for p in d["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); return True
    return False
pending = [j for j in J if not os.path.exists(j[0] + ".png")]
while pending:
    progress = False
    for j in list(pending):
        name, prompt, refs = j
        if not all(os.path.exists(r) for r in refs): continue
        for m in MODELS:
            try:
                if call(m, name + ".png", prompt, refs):
                    print("ok", name, m, time.strftime("%H:%M:%S"), flush=True); pending.remove(j); progress = True; break
            except Exception as e:
                print("..", name, m, str(e)[:40], flush=True)
    if pending and not progress: time.sleep(90)
print("ALLDONE", flush=True)
