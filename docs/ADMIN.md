# Админ-панель

## Вход

- URL: `/admin` (редирект на `/admin/login` без сессии)
- Вход по паролю. Пароль задаётся в переменной окружения `ADMIN_PASSWORD`.

## Переменные окружения

Скопируйте `.env.example` в `.env` и задайте:

- `AUTH_SECRET` — секрет для NextAuth (например: `openssl rand -base64 32`)
- `ADMIN_PASSWORD` — пароль входа в админку
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` — для Server Actions (обязателен при деплое; `openssl rand -base64 32`)

## Разделы

1. **Мероприятия** — создание и редактирование ивентов (фото, дата, артисты, билеты, текст «О мероприятии», мета).
2. **Главная страница** — hero (заголовки, дата, локация, фото ПК с drag-n-drop и превью), блок «О проекте», **галерея** (drag-n-drop, загрузка файлов, превью и просмотр в полном размере), отзывы.
3. **Метатеги** — title, description, canonical для SEO.

## Данные

Контент хранится в **SQLite** через Prisma:

- База: `prisma/dev.db` (или путь из `DATABASE_URL` в `.env`).
- Модели: `Event`, `Main`, `Meta` (см. `prisma/schema.prisma`).

После сохранения в админке изменения пишутся в БД. При сохранении вызывается **revalidatePath** для `/`, `/admin` и соответствующих страниц — кэш Next.js сбрасывается, пользователи видят актуальные данные без перезапуска.

**Загрузка изображений:** `POST /api/admin/upload` (multipart, поля `file` или `files`). Файлы сохраняются в `public/photos/`. Форматы: JPEG, PNG, WebP, GIF; макс. 10 МБ. Ответ: `{ paths: string[], ok: true }`.

**Миграции и сид:**
```bash
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev   # при изменении схемы
DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/seed.ts   # заполнить из data/*.json (один раз)
```

## Редактор контента

В проекте подключён TipTap (`RichTextEditor` в `src/components/admin/RichTextEditor.tsx`) для форматированного текста. В формах мероприятий и главной пока используются обычные поля и абзацы; при необходимости любые текстовые блоки можно заменить на `RichTextEditor`.

## Тесты

E2E (Playwright):

```bash
# Установка браузеров (один раз)
npx playwright install

# Запуск тестов (поднимает dev-сервер, проверяет вход и переходы)
ADMIN_PASSWORD=yourpassword npm run test:e2e
```

Без `ADMIN_PASSWORD` тест входа с правильным паролем пропускается.

## Тесты загрузки изображений

### В консоли браузера (на странице /admin/main, будучи авторизованным)

Проверка ответа API и предпросмотра:

```javascript
// 1) Создать тестовый файл (маленькое изображение)
const blob = new Blob(['\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'], { type: 'image/png' });
const form = new FormData();
form.append('file', blob, 'test.png');

// 2) Загрузить и проверить ответ
const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
const data = await res.json();
console.log('Status:', res.status, 'OK:', res.ok);
console.log('Response:', data);
console.assert(res.ok && data.ok === true && Array.isArray(data.paths) && data.paths.length > 0, 'API должен вернуть { ok: true, paths: [...] }');

// 3) Проверка предпросмотра: запрос по первому пути
if (data.paths?.[0]) {
  const imgRes = await fetch(data.paths[0]);
  console.log('Preview URL', data.paths[0], '→', imgRes.status);
  console.assert(imgRes.ok, 'Изображение по пути должно отдаваться (200)');
}
console.log('Тесты загрузки пройдены.');
```

### Скрипт (Node)

Сервер должен быть запущен, нужна авторизация (cookie). Получить cookie: DevTools → Application → Cookies → `next-auth.session-token` (или `__Secure-next-auth.session-token`).

```bash
# В .env или передать COOKIE вручную (значение из браузера)
COOKIE="next-auth.session-token=..." node scripts/test-upload-api.mjs
```

Скрипт отправляет один тестовый PNG на `POST /api/admin/upload`, проверяет ответ и доступность изображения по возвращённому пути.
