# Карта архитектуры Next.js в проекте CancelBefore

Краткий справочник: App Router, серверные/клиентские компоненты, layout-и и маршруты.

---

## 1. App Router — структура маршрутов

Проект использует **App Router** (`src/app/`). Сегменты разделены **route groups** в скобках — они не влияют на URL, только на организацию и общие layout-и.

```
src/app/
├── layout.tsx                    # Корневой layout (все страницы)
├── globals.css
│
├── (marketing)/                  # Группа: лендинг и публичные страницы
│   ├── layout.tsx               # Layout: Header + main + Footer
│   ├── page.tsx                 # / — главная
│   └── login/
│       └── page.tsx             # /login
│
├── (app)/                       # Группа: приложение (залогиненный пользователь)
│   ├── layout.tsx               # Layout: Header + main + Footer
│   ├── loading.tsx              # UI загрузки для (app)
│   ├── error.tsx                # Обработка ошибок (client)
│   ├── dashboard/
│   │   └── page.tsx             # /dashboard — панель: статистика, список подписок, добавление и редактирование
│   └── subscriptions/
│       ├── page.tsx             # /subscriptions → redirect /dashboard
│       ├── new/
│       │   └── page.tsx         # /subscriptions/new → redirect /dashboard
│       └── [id]/
│           └── page.tsx         # /subscriptions/:id — детали подписки и правила напоминаний
│
└── api/                         # API Routes (не используют layout)
    ├── auth/[...nextauth]/route.ts
    ├── subscriptions/route.ts
    ├── subscriptions/[id]/route.ts
    ├── subscriptions/[id]/reminder-rules/route.ts
    ├── reminder-rules/[id]/route.ts
    ├── webhooks/stripe/route.ts
    └── cron/reminders/route.ts
```

**Важно:**  
- URL для пользователя: `/`, `/login`, `/dashboard`, `/subscriptions/:id` (остальное — редиректы на `/dashboard`).  
- Папки `(marketing)` и `(app)` в URL не участвуют.  
- `api/*` — отдельные маршруты, без обёртки из layout.

---

## 2. Layout-и (вложенность)

| Уровень | Файл | Назначение |
|--------|------|------------|
| **Root** | `src/app/layout.tsx` | `<html>`, `<body>`, шрифты (Roboto), глобальные стили, `ThemeProvider`. Обязателен для всех страниц. |
| **Marketing** | `src/app/(marketing)/layout.tsx` | Оболочка для `/` и `/login`: `Header` + `main` + `Footer`. |
| **App** | `src/app/(app)/layout.tsx` | Та же оболочка для `/dashboard`, `/subscriptions/*`: `Header` + `main` + `Footer`. |

Цепочка рендера для страницы приложения (например, `/dashboard`):

1. `RootLayout` → оборачивает в `ThemeProvider`, задаёт шрифты и язык.
2. `AppLayout` → добавляет `Header`, `main`, `Footer`.
3. В `main` подставляется содержимое страницы (например, `dashboard/page.tsx`).

Для маркетинговых страниц вместо `AppLayout` используется `MarketingLayout`; структура та же (Header + main + Footer).

---

## 3. Серверные и клиентские компоненты

По умолчанию в App Router все компоненты в `app/` и импортируемые из них — **серверные** (Server Components). Клиентскими становятся только те, у которых в начале файла указано `"use client"`.

### Где выполняется рендер

| Место | Сервер | Клиент |
|-------|--------|--------|
| **Layout-и** | `app/layout.tsx`, `(marketing)/layout.tsx`, `(app)/layout.tsx` | — |
| **Страницы** | Все `page.tsx` (dashboard, subscriptions, login, marketing home) | — |
| **API Routes** | Все `route.ts` (обработка запросов на сервере) | — |
| **Спец. файлы** | `loading.tsx` (серверный UI загрузки) | `error.tsx` (нужен `onClick` для reset) |

### Компоненты с `"use client"`

| Компонент | Назначение |
|-----------|------------|
| `ThemeProvider` | Обёртка next-themes (состояние темы в браузере). |
| `ThemeToggle` | Переключатель темы (интерактивность). |
| `SubscriptionForm` | Форма создания/редактирования подписки (react-hook-form, submit в API). |
| `ReminderRulesManager` | Управление правилами напоминаний (форма, состояние, API). |
| `LoginForm` | Форма входа (signIn, роутинг). |
| `(app)/error.tsx` | Страница ошибки с кнопкой «Повторить» (reset). |

Страницы в `(app)` и `(marketing)` — серверные: они могут вызывать `getAuthSession()`, `db.*` и т.п. Внутри них вставляются клиентские островки (формы, тогглы), которые уже работают в браузере.

---

## 4. Сводная схема

```
                    RootLayout (server)
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
   (marketing)                        (app)
   MarketingLayout                    AppLayout
   (server)                           (server)
         │                               │
    ┌────┴────┐                    ┌─────┴─────┐
    ▼         ▼                    ▼           ▼
  page.tsx  login/            dashboard/   subscriptions/
  (server)  page.tsx           page.tsx    page.tsx, new/, [id]/
            (server)           (server)    (server)
                 │                  │           │
                 ▼                  │           ▼
            LoginForm          (данные      SubscriptionForm,
            (client)            с БД)       ReminderRulesManager
                                            (client)
```

- **Сервер:** layout-и, все page.tsx, API routes, доступ к БД и сессии.  
- **Клиент:** только компоненты с `"use client"` (формы, тема, error reset).

---

## 5. Чек-лист понимания (Этап 1)

- [ ] Где в проекте серверный рендер? — Все layout-и и page.tsx в `app/`, все API route.
- [ ] Где клиентская интерактивность? — В компонентах с `"use client"` (формы, ThemeToggle, error.tsx).
- [ ] Как App Router связывает сегменты? — Route groups `(marketing)` и `(app)` задают общие layout-и; URL определяют только папки без скобок и файлы `page.tsx` / `route.ts`.

После прохождения Этапа 1 можно переходить к трассировке Request Flow (Этап 2) для фичи Subscriptions.
