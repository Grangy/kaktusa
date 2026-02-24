#!/bin/bash
# Полная настройка сервера: swap, Node, PM2, Nginx
# Запуск: ./deploy/full-setup.sh

set -e

SERVER="89.125.37.62"
USER="root"
KEY="${HOME}/.ssh/shared_server_key"

echo "=== 1. Копирование и выполнение server-setup ==="
scp -i "$KEY" -o StrictHostKeyChecking=no deploy/server-setup.sh $USER@$SERVER:/root/
ssh -i "$KEY" $USER@$SERVER "chmod +x /root/server-setup.sh && /root/server-setup.sh"

echo "=== 2. Настройка Nginx ==="
scp -i "$KEY" deploy/nginx-tusa.conf $USER@$SERVER:/etc/nginx/sites-available/tusa.grangy.ru
ssh -i "$KEY" $USER@$SERVER "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t && systemctl reload nginx"

echo "=== Готово. Теперь запустите: ./deploy/deploy.sh ==="
echo "=== Когда домен привяжется — SSL: ssh $USER@$SERVER 'certbot --nginx -d tusa.grangy.ru' ==="
