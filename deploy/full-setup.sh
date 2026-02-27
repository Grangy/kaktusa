#!/bin/bash
# Полная настройка сервера: swap, Node, PM2, Nginx
# Запуск: ./deploy/full-setup.sh
# Требует DEPLOY_SERVER и DEPLOY_SSH_KEY в .env.

set -e

cd "$(dirname "$0")/.."
if [ -f .env ]; then set -a; source .env; set +a; fi
SERVER="${DEPLOY_SERVER}"
USER="${DEPLOY_USER:-root}"
KEY="${DEPLOY_SSH_KEY}"

if [ -z "$SERVER" ] || [ -z "$KEY" ]; then
  echo "❌ Задайте DEPLOY_SERVER и DEPLOY_SSH_KEY в .env."
  exit 1
fi

echo "=== 1. Копирование и выполнение server-setup ==="
scp -i "$KEY" -o StrictHostKeyChecking=no deploy/server-setup.sh $USER@$SERVER:/root/
ssh -i "$KEY" $USER@$SERVER "chmod +x /root/server-setup.sh && /root/server-setup.sh"

echo "=== 2. Настройка Nginx ==="
scp -i "$KEY" deploy/nginx-tusa.conf $USER@$SERVER:/etc/nginx/sites-available/tusa.grangy.ru
ssh -i "$KEY" $USER@$SERVER "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"

echo "=== Готово. Теперь запустите: ./deploy/deploy.sh ==="
echo "=== Когда домен привяжется — SSL: ssh $USER@$SERVER 'certbot --nginx -d tusa.grangy.ru' ==="
