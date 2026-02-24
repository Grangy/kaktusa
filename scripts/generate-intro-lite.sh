#!/bin/bash
# Генерирует intro-poster.jpg и intro-lite.mp4 для слабого интернета.
# Требует: ffmpeg. Запуск: ./scripts/generate-intro-lite.sh

set -e
cd "$(dirname "$0")/.."
SRC="public/intro.mp4"
[ -f "$SRC" ] || { echo "No $SRC"; exit 1; }

echo "Poster..."
ffmpeg -i "$SRC" -vframes 1 -q:v 2 -y public/intro-poster.jpg -hide_banner -loglevel error

echo "Lite video (480p, ~350 kbps)..."
ffmpeg -i "$SRC" -vf "scale=-2:480" -c:v libx264 -crf 28 -preset medium -movflags +faststart -an -y public/intro-lite.mp4 -hide_banner -loglevel warning

echo "Done: public/intro-poster.jpg, public/intro-lite.mp4"
