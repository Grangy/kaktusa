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
   ```bash
   git add -A && git commit -m "..." && git push
   npm run deploy
   ```  
   `npm run deploy`: на сервере `git pull` → (если есть локально `prisma/dev.db` — копирование БД на сервер) → `npm ci` → `prisma generate` → `prisma db push` → `npm run build` → копирование static/public в standalone → PM2 restart → nginx reload.

   **Важно:** В репозитории должны быть запушены папка `prisma/` (schema.prisma и т.д.), `ecosystem.config.cjs` с `DATABASE_URL`, и весь код приложения. Иначе скрипт выдаст ошибку и подскажет, что нужно сделать push.

## SSL (один раз)

На сервере нужно один раз выдать сертификат:

```bash
npm run ssl
```

или вручную:

```bash
scp -i ~/.ssh/shared_server_key deploy/ssl-setup.sh root@89.125.37.62:/root/
ssh -i ~/.ssh/shared_server_key root@89.125.37.62 "chmod +x /root/ssl-setup.sh && /root/ssl-setup.sh"
```

После этого https://kaktusa.ru будет работать с Let's Encrypt.
