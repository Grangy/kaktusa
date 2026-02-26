# ?КАКТУСА

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

Создайте `.env` в корне:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-min-32-chars"
ADMIN_PASSWORD="admin"
```

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

Деплой через SSH на сервер:

- **Полный** (`npm run deploy`): git pull → npm ci → prisma db push → seed → build → pm2 → nginx
- **Лайт** (`npm run deploy:light`): git pull → prisma db push → build → pm2 restart

Сервер: PM2 (Node), Nginx (прокси), SQLite-БД в `/var/www/kaktusa/prisma/dev.db`.

---

## Админ-панель

`/admin` — вход по паролю (ADMIN_PASSWORD).

- **Главная** — hero (видео, изображения, дата, логотипы), о нас, галерея, отзывы
- **Мета** — title, description, canonical
- **Мероприятия** — CRUD, hero-блок, билеты, галерея

---

## Лицензия

Private.
