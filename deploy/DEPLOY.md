# Деплой КАКТУСА

## Репозиторий

**https://github.com/Grangy/kaktusa**

Деплой через Git: код пушится в GitHub, на сервере выполняется `git pull`, установка зависимостей, сборка и перезапуск PM2.

## Порядок перед деплоем

1. **Проверка в dev**  
   ```bash
   npm run dev
   ```  
   Убедиться, что всё работает: главная, страницы событий, навигация.

2. **Замер производительности (опционально)**  
   ```bash
   npm run dev:perf
   ```  
   Замер времени ответа основных страниц.

3. **Линт**  
   ```bash
   npm run lint
   ```

4. **Пуш в GitHub и деплой**

   **Лайт (быстрый, ~25–35 с)** — когда менялся только код (src/), без package.json и prisma:
   ```bash
   git add -A && git commit -m "..." && git push
   npm run deploy:light
   ```

   **Хард (полный, ~50–60 с)** — при изменении package.json, prisma/schema.prisma, БД, nginx:
   ```bash
   git add -A && git commit -m "..." && git push
   npm run deploy:hard
   ```

   | Команда        | Git | БД | npm ci | Prisma | Build | PM2 | Nginx |
   |----------------|-----|----|--------|--------|-------|-----|-------|
   | deploy:light   | ✓   | —  | —      | —      | ✓     | ✓   | —     |
   | deploy:hard    | ✓   | ✓  | ✓      | ✓      | ✓     | ✓   | ✓     |

   Аудит деплоя показывается в конце — время каждого этапа.

## SSL (один раз)

На сервере нужно один раз выдать сертификат:

```bash
npm run ssl
```

или вручную (переменные из .env: DEPLOY_SSH_KEY, DEPLOY_SERVER; DEPLOY_USER по умолчанию root):

```bash
scp -i "$DEPLOY_SSH_KEY" deploy/ssl-setup.sh "${DEPLOY_USER:-root}"@$DEPLOY_SERVER:/root/
ssh -i "$DEPLOY_SSH_KEY" "${DEPLOY_USER:-root}"@$DEPLOY_SERVER "chmod +x /root/ssl-setup.sh && /root/ssl-setup.sh"
```

После этого https://kaktusa.ru будет работать с Let's Encrypt.
