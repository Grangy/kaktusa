#!/bin/bash
# Один раз выполнить на сервере: клонирует GitHub в /var/www/kaktusa, ставит зависимости, билдит, запускает PM2.
# Локально: scp deploy/setup-server-git.sh root@89.125.37.62:/root/ && ssh root@89.125.37.62 "chmod +x /root/setup-server-git.sh && /root/setup-server-git.sh"
# Или: ssh root@89.125.37.62 'bash -s' < deploy/setup-server-git.sh

set -e
REPO="https://github.com/Grangy/kaktusa.git"
DIR="/var/www/kaktusa"

echo "=== Clone from GitHub ==="
if [ -d "$DIR/.git" ]; then
  echo "Already a git repo, pulling..."
  (cd "$DIR" && git fetch origin && git reset --hard origin/main)
else
  [ -d "$DIR" ] && mv "$DIR" "${DIR}.bak.$(date +%s)"
  git clone "$REPO" "$DIR"
fi

echo "=== Install & Build ==="
cd "$DIR"
npm ci --no-audit --no-fund
npm run build
npm prune --omit=dev

echo "=== Prepare standalone ==="
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "=== PM2 ==="
pm2 delete kaktusa 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo "=== Done. Deploy next time: git push then npm run deploy ==="
