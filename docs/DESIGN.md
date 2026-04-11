# Design System

Tailwind v4, CSS-переменные в `src/app/globals.css`.

---

## Colors

| Token     | CSS Variable      | Value     | Usage                                  |
|-----------|-------------------|-----------|----------------------------------------|
| `dark`    | `--color-dark`    | `#171717` | фон страницы (`body`)                  |
| `middle`  | `--color-middle`  | `#1f1f1f` | фон toggle (неактивный)                |
| `light`   | `--color-light`   | `#f0efec` | основной текст                         |
| `grays`   | `--color-grays`   | `#a8a8a2` | вторичный текст, лейблы, placeholder   |
| `primary` | `--color-primary` | `#ffffff` | CTA-кнопки, активные бордеры, акцент   |
| `border`  | `--color-border`  | `#333333` | бордеры по умолчанию (`border-border`) |

Цветовая схема: **тёмный монохром**. `primary` — белый, никакого цветного акцента.

---

## Typography

- **Font:** Inter (Google Fonts, `subsets: ["latin", "cyrillic"]`)
- Обычный регистр везде — никаких `uppercase`.

| Класс         | Применение                                          |
|---------------|-----------------------------------------------------|
| `text-4xl`    | Hero-заголовок на главной                           |
| `text-lg`     | Hero-подзаголовок                                   |
| `text-base`   | Заголовки страниц (вход, регистрация)               |
| `text-sm`     | Основной UI: кнопки, инпуты, лейблы форм, навигация |
| `text-xs`     | Вторичные подписи, лейблы карточек, бейджи          |
| `font-mono`   | Сгенерированные данные                              |
| `font-medium` | Кнопки, заголовки                                   |
| `font-semibold` | Hero-заголовок, название в хэдере                 |

---

## Spacing

| Класс         | Применение                          |
|---------------|-------------------------------------|
| `p-6`         | внутренний padding секции           |
| `p-8`         | отступ страницы                     |
| `px-4 py-1.5` | кнопка default                      |
| `px-3 py-1`   | кнопка sm                           |
| `px-3 py-1.5` | инпуты, select                      |
| `px-2 py-1.5` | select (компактный)                 |
| `gap-3`       | между кнопками в ряду               |
| `gap-4`       | grid-колонки                        |
| `space-y-4`   | между блоками внутри секции         |
| `mb-1`        | между лейблом и инпутом             |

---

## Border Radius

| Класс          | Value | Применение                         |
|----------------|-------|------------------------------------|
| `rounded`      | 4px   | кнопки, инпуты, select, бейджи     |
| `rounded-md`   | 6px   | —                                  |
| `rounded-lg`   | 8px   | —                                  |
| `rounded-full` | 50%   | toggle knob/track                  |

---

## Components

### Button — Primary (CTA)
```
border-primary bg-primary text-dark rounded
px-4 py-1.5 text-sm font-medium
cursor-pointer border duration-100
hover:opacity-80
disabled:cursor-not-allowed disabled:opacity-40
```

### Button — Outline / Secondary
```
border-border text-grays rounded
px-4 py-1.5 text-sm font-medium
cursor-pointer border duration-100
hover:border-primary hover:text-primary
disabled:cursor-not-allowed disabled:opacity-30
```

### Button — Ghost
```
border-transparent text-grays rounded
cursor-pointer border duration-100
hover:border-border hover:text-light
```

### Input
```
rounded border border-border bg-transparent px-3 py-1.5 text-sm text-light
placeholder:text-grays
focus:border-primary focus:outline-none
disabled:cursor-not-allowed disabled:opacity-50
```

Ошибка валидации: `border-red-500` вместо `border-border`.

### Select
```
rounded border border-border bg-transparent px-2 py-1.5 text-sm text-light
focus:border-primary focus:outline-none
[color-scheme:dark]
```

### Toggle (switch)
```
/* track */
relative h-5 w-9 rounded-full transition-colors duration-200
active:   bg-primary
inactive: bg-middle border-border border

/* knob */
bg-light absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow
transition-transform duration-200
active:   translate-x-4
inactive: translate-x-0
```

### Секция
```
/* контейнер */
border border-border

/* содержимое */
space-y-4 p-6
```

### Result block (список строк)
```
/* обёртка */
border border-border

/* строка */
flex items-center justify-between gap-4 px-4 py-2

/* разделитель строк */
border-t border-border (или -mt-px на li)
```

### Сообщение об ошибке
```
text-xs text-red-400
```

---

## Layout

- **Max ширина:** `max-w-screen-lg` (1024px)
- **Паддинг контейнера:** `px-6`
- **Header:** `border-b border-border`, высота `h-12`, flex justify-between
- **Hero:** `py-24`, заголовок `text-4xl font-semibold`, подзаголовок `text-lg text-grays`

---

## Иконки

Не используются. При добавлении — Lucide React (`pnpm add lucide-react`).
