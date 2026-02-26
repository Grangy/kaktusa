# 🐱 ?КАКТУСА

Проект создал добрый энтузиаст **Макс Grangy** для хороших людей &lt;3

**Сайт проекта электронных ивентов с особым смыслом и звучанием в уникальных локациях Крыма.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite)](https://www.sqlite.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-bb4bec)](https://www.framer.com/motion/)
[![Next-Auth](https://img.shields.io/badge/Next--Auth-5-000000?logo=auth0)](https://authjs.dev/)

---

## О проекте

?КАКТУСА — лендинг проекта электронных ивентов в Крыму. Объединяет людей с изысканным музыкальным вкусом в уникальных локациях (ночные клубы, отели).

### Основные возможности

- **Главная страница** — hero с видео, карусель мероприятий, о проекте, галерея, отзывы
- **Страницы мероприятий** — предстоящие и прошедшие ивенты с детальным описанием, билетами, галереей
- **Админ-панель** — редактирование контента (главная, мета, мероприятия), drag-and-drop для порядка элементов
- **Блуждание фона** — плавная анимация hero-изображений на главной и страницах ивентов
- **Смена логотипа** — основной / минималистичный при скролле (главная и ивенты)
- **Адаптивность** — мобильная вёрстка, оптимизация изображений

---

## Технологии

| Категория | Стек |
|-----------|------|
| **Фреймворк** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4 |
| **Анимация** | Framer Motion |
| **БД** | SQLite + Prisma (better-sqlite3) |
| **Auth** | Next-Auth 5 |
| **Редактор** | TipTap (rich text) |
| **Деплой** | PM2, Nginx, SSH |

---

## Структура проекта

```
kaktusa.ru/
├── src/
│   ├── app/                    # App Router
│   │   ├── page.tsx            # Главная
│   │   ├── events/[slug]/      # Страницы мероприятий
│   │   ├── admin/              # Админка (main, meta, events)
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── Header.tsx          # Хедер со сменой логотипа
│   │   ├── HeroSection.tsx     # Hero главной
│   │   ├── EventsCarousel.tsx  # Карусель мероприятий
│   │   ├── events/             # EventLanding, PastEventLanding
│   │   └── admin/              # Формы, редакторы
│   ├── lib/                    # data, db, upload, photoUrl
│   └── types/
├── prisma/
│   ├── schema.prisma           # Event, Main, Meta
│   ├── seed.ts                 # Сидер
│   └── migrations/
├── deploy/                     # SSH-деплой
│   ├── deploy.mjs              # Полный деплой
│   └── deploy-light.mjs        # Лайт (без npm ci)
├── data/                       # events.json, main.json (для seed)
└── public/                     # Статика, фото
```

---

## Структура страниц

| URL | Описание |
|-----|----------|
| `/` | **Главная** — Preloader → Hero (видео + фото ПК с блужданием) → Карусель мероприятий → О нас → Галерея → Отзывы |
| `/events/[slug]` | **Страница мероприятия** — Hero с блужданием фона → Когда/Локация/Цена → О мероприятии → Локация → Выберите билет → Прошедшие мероприятия → Возраст/Дресс-код/Правила → Галерея. Для прошлых ивентов (`type: past`) — версия без билетов и обратного отсчёта |
| `/admin` | **Админка** — дашборд с ссылками на разделы |
| `/admin/login` | Вход по паролю |
| `/admin/main` | Редактирование главной |
| `/admin/meta` | SEO: title, description, canonical |
| `/admin/events` | Список мероприятий (создать, редактировать, удалить) |
| `/admin/events/[slug]` | Форма мероприятия |

---

## Админ-панель: как редактировать

Вход: `/admin` → пароль из `ADMIN_PASSWORD`.

### Главная (`/admin/main`)

| Блок | Что редактировать | Подсказка |
|------|-------------------|-----------|
| **Hero** | Заголовок (верх/низ), дата, локация (рус/англ), логотипы (в hero и после скролла), фото ПК | Фото ПК — drag-and-drop, смена по таймеру на десктопе. Видео hero задаётся в коде (videoFull, videoLite) |
| **О проекте** | Заголовок, абзацы текста (+ Абзац), ссылка кнопки | Абзацы — массив, порядок сохраняется |
| **Галерея** | Фото главной страницы | Drag-and-drop порядка, загрузка файлов, превью |
| **Отзывы** | Текст, автор | Drag-and-drop для приоритета показа в карусели |

### Мета (`/admin/meta`)

| Поле | Назначение |
|------|------------|
| Title | Заголовок страницы (главная) |
| Description | Meta description для SEO |
| Canonical URL | Канонический URL сайта |

### Мероприятия (`/admin/events`)

Кнопка **«Создать»** → новый ивент. В списке — клик по названию для редактирования, кнопка удаления.

**Форма мероприятия:**

| Блок | Поля |
|------|------|
| **Основное** | Тип (предстоящее/прошло), slug (URL), название, дата, дата для отображения, время, локация, краткая локация, цена, примечание к цене |
| **Hero** | Картинка, тег, стиль тега, заголовок (верх/низ), tagline (HTML) |
| **Мета** | metaTitle, metaDescription |
| **Билеты** | Массив: id, название, цена, Early Bird. Ссылка «Купить билет» |
| **О мероприятии** | Абзацы (rich text), артисты (список) |
| **Локация** | venueTitle, address, city |
| **Доп. инфо** | Возраст, дресс-код, правила, subtitle (для прошлых) |
| **Галерея** | Фото страницы мероприятия |

Загрузка изображений: перетащить файл в поле или нажать «Загрузить». Файлы сохраняются в `public/photos/`. После сохранения вызывается revalidatePath — изменения видны сразу.

---

## Быстрый старт

### Требования

- Node.js 18+
- npm

### Установка

```bash
git clone https://github.com/Grangy/kaktusa.git
cd kaktusa
npm install
```

### Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

Обязательно: `AUTH_SECRET`, `ADMIN_PASSWORD`. Для деплоя также нужен `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (сгенерируйте: `openssl rand -base64 32`).

### Запуск

```bash
# БД: создать/применить схему
npm run db:push

# Сидер (если нужно)
npm run db:seed

# Разработка
npm run dev
```

Сайт: [http://localhost:3000](http://localhost:3000)

---

## Сборка и продакшен

```bash
npm run build
npm run start
```

Standalone-режим (для PM2):

```bash
npm run build
# Используйте output: 'standalone' в next.config
```

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка |
| `npm run start` | Запуск продакшена |
| `npm run lint` | ESLint |
| `npm run db:push` | Prisma db push (локально) |
| `npm run db:seed` | Сидер |
| `npm run deploy` | Полный деплой (npm ci + prisma + build + pm2) |
| `npm run deploy:light` | Лайт-деплой (git pull + build + pm2) |

---

## Деплой

Деплой через SSH на сервер. В `.env` должен быть `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (тот же ключ — на сервере в `/var/www/kaktusa/.env` для PM2 и локально для скриптов деплоя).

- **Полный** (`npm run deploy`): git pull → npm ci → prisma db push → seed → build → pm2 → nginx
- **Лайт** (`npm run deploy:light`): git pull → prisma db push → build → pm2 restart

Сервер: PM2 (Node), Nginx (прокси), SQLite-БД в `/var/www/kaktusa/prisma/dev.db`. См. `deploy/README.md`.

---

## Лицензия

Private.
