# Деплой КАКТУСА на 89.125.37.62

Домены: **kaktusa.ru**, www.kaktusa.ru, tusa.grangy.ru (все на одном проекте)

## 1. Первичная настройка сервера (один раз)

```bash
ssh -i ~/.ssh/shared_server_key root@89.125.37.62
scp -i ~/.ssh/shared_server_key deploy/server-setup.sh root@89.125.37.62:/root/
ssh -i ~/.ssh/shared_server_key root@89.125.37.62 "chmod +x /root/server-setup.sh && /root/server-setup.sh"
```

## 2. Настройка Nginx

```bash
scp -i ~/.ssh/shared_server_key deploy/nginx-tusa.conf root@89.125.37.62:/etc/nginx/sites-available/tusa.grangy.ru
ssh -i ~/.ssh/shared_server_key root@89.125.37.62 "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
```

## 3. Деплой приложения

**Рекомендуемый порядок:** проверка в dev (`npm run dev`), при необходимости замер перформанса (`npm run dev:perf`), затем деплой. Подробнее — [DEPLOY.md](DEPLOY.md).

**Деплой (всегда с билдом):**
```bash
npm run deploy
```
Скрипт сам выполняет билд, выгружает только изменённые файлы (rsync), перезапускает PM2 и обновляет nginx.

**Классический (Bash):**
```bash
./deploy/deploy.sh
```

## 4. DNS для kaktusa.ru

В панели регистратора домена добавьте A-записи:
- `kaktusa.ru` → `89.125.37.62`
- `www.kaktusa.ru` → `89.125.37.62`

## 5. SSL (один раз, после привязки доменов к серверу)

```bash
npm run ssl
```
или вручную: скопировать и выполнить на сервере `deploy/ssl-setup.sh`.

## Порядок действий

1. server-setup.sh (один раз)
2. Настроить nginx
3. deploy.sh — деплой приложения
4. Добавить DNS для kaktusa.ru
5. ssl-setup.sh — сертификат Let's Encrypt для всех доменов
