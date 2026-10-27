# Render a long composition in scene-aligned chunks (muted) + audio, then join with Remotion's bundled ffmpeg.
# Run inside the Remotion project:  bash render_film.sh Film OUT.mp4 0 1359 3213 4890 6753 8331 9720
# (cut points are frame numbers; put them on scene cuts. Finished chunks are skipped, so re-running resumes.)
B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
ID=$1; OUT=$2; shift 2; CUTS=("$@"); N=$((${#CUTS[@]}-1))
FF="npx remotion ffmpeg"
mkdir -p out; : > out/list.txt
for ((i=0; i<N; i++)); do
  a=${CUTS[$i]}; b=$((${CUTS[$((i+1))]}-1))
  echo "file 'film$i.mp4'" >> out/list.txt
  [ -s out/film$i.mp4 ] && { echo "film$i exists"; continue; }
  for try in 1 2; do
    npx remotion render src/index.ts $ID out/film$i.mp4 --frames=$a-$b --muted --browser-executable=$B --gl=swangle --concurrency=4 --crf=18 --timeout=180000 --overwrite > out/film$i.log 2>&1 && { echo "film$i ok $(date +%T)"; break; }
    echo "film$i fail $try (see out/film$i.log)"
  done
done
npx remotion render src/index.ts $ID out/audio.wav --codec=wav --browser-executable=$B --overwrite > out/audio.log 2>&1 && echo "audio ok"
for ((i=0; i<N; i++)); do [ -s out/film$i.mp4 ] || { echo "FAILED film$i"; exit 1; }; done
[ -s out/audio.wav ] || { echo "FAILED audio"; exit 1; }
$FF -loglevel error -y -f concat -safe 0 -i out/list.txt -c copy out/video.mp4
$FF -loglevel error -y -i out/video.mp4 -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo DONE "$OUT"
