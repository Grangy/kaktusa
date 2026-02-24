#!/bin/bash
# Сжатие видео в public без заметной потери качества (CRF 18, preset slow).
# Требует: ffmpeg. Запуск: ./scripts/compress-videos.sh

set -e
cd "$(dirname "$0")/.."
PUBLIC="public"

for f in "$PUBLIC"/intro.mp4; do
  [ -f "$f" ] || continue
  echo "Compressing $f (high quality, CRF 18)..."
  tmp=$(mktemp -u "${f}.tmp.XXXXXX.mp4")
  ffmpeg -i "$f" -c:v libx264 -crf 18 -preset slow -movflags +faststart -an -y "$tmp" -hide_banner -loglevel warning
  mv "$tmp" "$f"
  echo "Done: $f"
done
echo "All done."
