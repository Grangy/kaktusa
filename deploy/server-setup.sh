#!/bin/bash
# Run this script on the server ONCE (ssh to DEPLOY_SERVER)
# Sets up: swap, Node.js 20, PM2, Nginx

set -e

echo "=== Updating system ==="
apt-get update && apt-get upgrade -y

echo "=== Setting up SWAP (2GB) ==="
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  sysctl -p
  echo "Swap created: 2GB"
else
  echo "Swap already exists"
fi

echo "=== Installing Node.js 20 ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "=== Installing PM2 ==="
npm install -g pm2

echo "=== Installing Nginx ==="
apt-get install -y nginx

echo "=== Creating app directory ==="
mkdir -p /var/www/kaktusa

echo "=== Server setup complete ==="
echo "Next: run deploy.sh from local machine"
