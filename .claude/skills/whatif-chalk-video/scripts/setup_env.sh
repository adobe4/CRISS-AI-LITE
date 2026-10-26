# One-time setup in a fresh cloud session.
pip install -q faster-whisper vtracer scipy imageio-ffmpeg pypdfium2 2>/dev/null
ln -sf $(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") /usr/local/bin/ffmpeg
# Roboto Black as a SYSTEM font (web-font loading stalls Remotion renders - never use delayRender for fonts)
mkdir -p ~/.fonts; U=$(curl -s -A "Mozilla/4.0" "https://fonts.googleapis.com/css2?family=Roboto:wght@900" | grep -o "https://fonts.gstatic.com[^)]*" | head -1)
curl -s -o ~/.fonts/Roboto-Black.ttf "$U"; fc-cache -f >/dev/null 2>&1; fc-list | grep -i "roboto black"
echo "Remotion: npm i remotion@4.0.300 @remotion/cli@4.0.300 @remotion/paths@4.0.300 react@18.3.1 react-dom@18.3.1"
