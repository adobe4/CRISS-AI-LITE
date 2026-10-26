# Download the standard SFX kit from Mixkit (free licence, commercial YouTube use OK, no credit needed).
# Usage: bash mixkit_sfx.sh OUT_DIR
mkdir -p "$1"; cd "$1"
for p in 1143:deep_impact 788:big_impact 772:zoom_impact 2182:wood_hit 1490:whoosh_fast 1492:whoosh_cine 1489:air_woosh 1464:swoosh_accent 166:sweep_small 1530:paper_slide 2380:paper_quick 1104:page_turn 2369:scribble 3194:pencil 2376:pencil_short 1430:shutter 3005:pop_whoosh 2364:pop_hard 1045:tick_tock 1064:knob_spin 498:heartbeat_impact 2385:paper_crinkle; do
  id=${p%%:*}; n=${p##*:}; curl -s -m 30 -A "Mozilla/5.0" -o $n.mp3 "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"; echo "$n $(stat -c %s $n.mp3)"; done
# More: list a category with  curl -s -A "Mozilla/5.0" https://mixkit.co/free-sound-effects/<category>/ | grep -o 'sfx/[0-9]*/[0-9]*-preview.mp3'
