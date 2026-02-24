#!/bin/bash
# Убить все Next.js процессы и освободить порты 3000, 3001
echo "Останавливаю процессы..."
pkill -9 -f "next-server" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
sleep 1
if lsof -i:3000 -i:3001 2>/dev/null | grep -q LISTEN; then
  echo "⚠ Порты всё ещё заняты. Закройте все терминалы с npm run dev."
else
  echo "✓ Порты 3000, 3001 свободны"
fi
