# Деплой КАКТУСА

Домены: **kaktusa.ru**, www.kaktusa.ru, tusa.grangy.ru (все на одном проекте).

**Локально** в `.env` нужны для деплоя: **DEPLOY_SERVER**, **DEPLOY_SSH_KEY** (путь к приватному ключу), **NEXT_SERVER_ACTIONS_ENCRYPTION_KEY**. Опционально: DEPLOY_USER (по умолчанию root), DEPLOY_REMOTE (по умолчанию /var/www/kaktusa). См. `.env.example`.

## 1. Первичная настройка сервера (один раз)

```bash
# Сначала: source .env или export DEPLOY_SERVER, DEPLOY_SSH_KEY (и опционально DEPLOY_USER, по умолчанию root)
ssh -i "$DEPLOY_SSH_KEY" "${DEPLOY_USER:-root}"@$DEPLOY_SERVER
scp -i "$DEPLOY_SSH_KEY" deploy/server-setup.sh "${DEPLOY_USER:-root}"@$DEPLOY_SERVER:/root/
ssh -i "$DEPLOY_SSH_KEY" "${DEPLOY_USER:-root}"@$DEPLOY_SERVER "chmod +x /root/server-setup.sh && /root/server-setup.sh"
```
(Или запустите `./deploy/full-setup.sh` — он подхватит переменные из .env.)

## 2. Настройка Nginx

```bash
scp -i "$DEPLOY_SSH_KEY" deploy/nginx-tusa.conf "${DEPLOY_USER:-root}"@$DEPLOY_SERVER:/etc/nginx/sites-available/tusa.grangy.ru
ssh -i "$DEPLOY_SSH_KEY" "${DEPLOY_USER:-root}"@$DEPLOY_SERVER "ln -sf /etc/nginx/sites-available/tusa.grangy.ru /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
```

## 3. Деплой через Git (https://github.com/Grangy/kaktusa)

**Первый раз на сервере** — клонировать репозиторий и собрать проект:
```bash
ssh -i "$DEPLOY_SSH_KEY" "${DEPLOY_USER:-root}"@$DEPLOY_SERVER 'bash -s' < deploy/setup-server-git.sh
```

**Далее деплой:** пушим в GitHub, затем на сервере делаем pull и пересборку:
```bash
git add -A && git commit -m "..." && git push
npm run deploy
```
`npm run deploy` подключается по SSH, в каталоге `/var/www/kaktusa` выполняет `git pull`, `npm ci`, `npm run build`, перезапуск PM2 и обновление nginx.

**Секреты:** В `.env` (локально и на сервере `/var/www/kaktusa/.env`) должны быть: `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `AUTH_SECRET`, `ADMIN_PASSWORD`. Никаких ключей в коде — только в .env. См. `.env.example`.

## 4. DNS для kaktusa.ru

В панели регистратора домена добавьте A-записи на IP вашего сервера (значение **DEPLOY_SERVER**, если это IP):
- `kaktusa.ru` → ваш_сервер
- `www.kaktusa.ru` → ваш_сервер

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
