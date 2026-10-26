# Render a long Remotion composition in 4 chunks + separate audio, then join. Survives single-chunk failures.
# Usage (inside the remotion project): bash render_chunks.sh COMP_ID TOTAL_FRAMES OUT_FILE
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ID=$1; N=$2; OUT=$3; mkdir -p out; q=$((N/4))
R(){ for a in 1 2 3; do npx remotion render src/index.ts $ID out/part$1.mp4 --frames=$2 --muted --browser-executable=$B --concurrency=$(nproc) --crf=18 --timeout=120000 --overwrite > out/part$1.log 2>&1 && { echo "part$1 ok"; return; }; echo "part$1 fail $a"; done; }
R 1 0-$((q-1)); R 2 $q-$((2*q-1)); R 3 $((2*q))-$((3*q-1)); R 4 $((3*q))-$((N-1))
npx remotion render src/index.ts $ID out/audio.wav --codec=wav --browser-executable=$B --overwrite > out/audio.log 2>&1 && echo "audio ok"
for i in 1 2 3 4; do [ -s out/part$i.mp4 ] || { echo "FAILED: part$i missing - see out/part$i.log"; exit 1; }; done
[ -s out/audio.wav ] || { echo "FAILED: audio - see out/audio.log"; exit 1; }
printf "file 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\nfile 'part4.mp4'\n" > out/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
ffmpeg -loglevel error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 6M -maxrate 8M -bufsize 12M -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k -shortest "$OUT"
echo DONE "$OUT"
