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

## 3. Деплой через Git (https://github.com/Grangy/kaktusa)

**Первый раз на сервере** — клонировать репозиторий и собрать проект:
```bash
ssh -i ~/.ssh/shared_server_key root@89.125.37.62 'bash -s' < deploy/setup-server-git.sh
```

**Далее деплой:** пушим в GitHub, затем на сервере делаем pull и пересборку:
```bash
git add -A && git commit -m "..." && git push
npm run deploy
```
`npm run deploy` подключается по SSH, в каталоге `/var/www/kaktusa` выполняет `git pull`, `npm ci`, `npm run build`, перезапуск PM2 и обновление nginx.

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
