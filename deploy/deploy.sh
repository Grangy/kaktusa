#!/bin/bash
# Run from project root: ./deploy/deploy.sh
# Требует DEPLOY_SERVER и DEPLOY_SSH_KEY в .env (или экспорт).

set -e

cd "$(dirname "$0")/.."
if [ -f .env ]; then set -a; source .env; set +a; fi
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
KEY="${DEPLOY_SSH_KEY}"
REMOTE_DIR="${DEPLOY_REMOTE:-/var/www/kaktusa}"
STANDALONE_DIR=".next/standalone/kaktusa.ru"

if [ -z "$SERVER" ] || [ -z "$KEY" ]; then
  echo "❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env (см. .env.example)."
  exit 1
fi

echo "=== 1/5 Building Next.js (standalone) ==="
npm run build

echo "=== 2/5 Preparing deployment bundle ==="
cp ecosystem.config.cjs "$STANDALONE_DIR/"

echo "=== 3/5 Uploading to server ==="
ssh -i "$KEY" -o StrictHostKeyChecking=no $USER@$SERVER "mkdir -p $REMOTE_DIR $REMOTE_DIR/.next"
rsync -avz --delete -e "ssh -i $KEY" "$STANDALONE_DIR/" $USER@$SERVER:$REMOTE_DIR/
rsync -avz -e "ssh -i $KEY" .next/static/ $USER@$SERVER:$REMOTE_DIR/.next/static/
rsync -avz -e "ssh -i $KEY" public/ $USER@$SERVER:$REMOTE_DIR/public/

echo "=== 4/5 Installing sharp for Linux (оптимизация изображений) ==="
ssh -i "$KEY" $USER@$SERVER "cd $REMOTE_DIR && npm install sharp --omit=dev --no-audit --no-fund 2>/dev/null || true"

echo "=== 5/5 Restarting PM2 ==="
ssh -i "$KEY" $USER@$SERVER "cd $REMOTE_DIR && pm2 restart ecosystem.config.cjs 2>/dev/null || pm2 start ecosystem.config.cjs"
ssh -i "$KEY" $USER@$SERVER "pm2 save"

echo "=== Deploy complete ==="
