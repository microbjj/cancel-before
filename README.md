# CancelBefore

CancelBefore — заготовка приложения для отслеживания подписок и напоминаний о дедлайнах отмены.

## Текущее состояние проекта

В репозитории уже есть:

- базовая структура `Next.js App Router` с разделением на `(marketing)` и `(app)` layouts;
- переключение светлой/тёмной темы через `next-themes`;
- MVP-страницы (скелеты) без бизнес-логики;
- сервисные API endpoints для Stripe webhook и cron-обработчика напоминаний;
- авторизация через `NextAuth` (MVP-вход по email) и защита app-маршрутов;
- база и ORM-слой на `PostgreSQL + Prisma`.

## Стек

- `Next.js` 16 + `React` 19 + `TypeScript`
- `Tailwind CSS` 4
- `Prisma` 7 + `@prisma/adapter-pg`
- `PostgreSQL` (локально через `docker-compose`)

## Маршруты

### Публичная зона

- `/` — маркетинговая страница
- `/login` — вход по email

### Приложение

- `/dashboard` — дашборд
- `/subscriptions` — список подписок
- `/subscriptions/new` — создание подписки
- `/subscriptions/[id]` — детали подписки

### Сервисные endpoints

- `GET/POST /api/subscriptions`
- `GET/PATCH/DELETE /api/subscriptions/[id]`
- `GET/POST /api/subscriptions/[id]/reminder-rules`
- `PATCH/DELETE /api/reminder-rules/[id]`
- `POST /api/webhooks/stripe`
  - ждёт заголовок `stripe-signature`
  - ждёт JSON c полями `id` и `type`
  - сохраняет событие в `WebhookEvent`
- `POST /api/cron/reminders`
  - ждёт заголовок `x-cron-secret`, который должен совпадать с `CRON_SECRET`
  - опциональный JSON body: `{ "dryRun": boolean, "limit": number }`

## Переменные окружения

Используется минимальный набор:

```env
DATABASE_URL=postgresql://cbd:cbd@localhost:5432/cbd?schema=public
NEXTAUTH_SECRET=replace_with_long_random_secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
CRON_SECRET=replace_with_long_random_secret
```

Скопируйте пример:

```bash
cp .env.example .env
```

Для Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Быстрый старт

### 1) Установка зависимостей

```bash
pnpm install
```

### 2) Поднять PostgreSQL

```bash
docker compose up -d
```

### 3) Сгенерировать Prisma Client

```bash
pnpm prisma:generate
```

### 4) Применить миграции

```bash
pnpm prisma:migrate:dev
```

### 5) Запустить приложение

```bash
pnpm dev
```

После запуска откройте `http://localhost:3000`.

### 6) Прогнать проверки

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## Smoke-проверка MVP

1. Откройте `/login`, войдите по email и убедитесь, что есть редирект на `/dashboard`.
2. Создайте подписку на `/subscriptions/new` и проверьте, что она появилась в списке `/subscriptions`.
3. Откройте `/subscriptions/[id]`, обновите поля и проверьте сохранение.
4. Добавьте правило напоминания на странице деталей и проверьте включение/выключение/удаление.
5. Вызовите `POST /api/cron/reminders` с корректным `x-cron-secret` и `dryRun=true`, проверьте статистику в ответе.
6. Проверьте, что весь интерфейс отображается на русском языке.

## Prisma-модели (минимальный контур)

В `prisma/schema.prisma` уже описаны:

- `User`
- `Subscription`
- `ReminderRule`
- `NotificationLog`
- `UserPlan`
- `Payment`
- `WebhookEvent`

Ключевые даты в `Subscription`: `trialEndsAt`, `firstChargeAt`, `cancelByAt`.