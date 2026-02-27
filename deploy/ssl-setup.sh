#!/bin/bash
# Run on server AFTER domains kaktusa.ru, www.kaktusa.ru, tusa.grangy.ru point to this server
# Sets up Let's Encrypt SSL for all domains

set -e

echo "=== Installing Certbot ==="
apt-get update
apt-get install -y certbot python3-certbot-nginx

echo "=== Creating certbot webroot ==="
mkdir -p /var/www/certbot

echo "=== Obtaining SSL certificate for kaktusa.ru, www.kaktusa.ru, tusa.grangy.ru ==="
certbot --nginx -d kaktusa.ru -d www.kaktusa.ru -d tusa.grangy.ru --non-interactive --agree-tos --email m.dolia2017@yandex.ru --redirect --expand

echo "=== SSL setup complete ==="
echo "Certificate auto-renews. Test: certbot renew --dry-run"
