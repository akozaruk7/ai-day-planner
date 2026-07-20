# AI-планер дня

Mobile-first to-do застосунок: користувач пише все, що в голові, а AI
перетворює це на структуровані задачі.

> Стан тримається на клієнті (React state + `localStorage`). Єдиний серверний
> шматок — ендпоінт `/api/parse`, який викликає Claude (щоб не світити ключ у браузері).

## AI-парсинг

- Ендпоінт: [app/api/parse/route.ts](app/api/parse/route.ts) — виклик **Claude Haiku 4.5**,
  структурований вивід через tool-use.
- Потрібна змінна оточення **`ANTHROPIC_API_KEY`** (див. `.env.local.example`).
  Локально — у `.env.local`; на Vercel — у Project → Settings → Environment Variables.
- За один виклик AI: парсить дамп на задачі, збагачує (`priority`, `estimateMin`,
  `deadline`), мітить `isToday` та до 3 `suggested`. Розподіл по Today/Inbox — правило в коді.

## Екрани

| Таб | Що робить |
| --- | --- |
| ✍️ **Захопити** (`/capture`) | Велике поле «Що в голові?» на весь екран + велика кнопка мікрофона. Текст-чернетка persist-иться у `localStorage`. |
| 📥 **Вхідні** (`/inbox`) | Список розпарсених задач (поки порожній). |
| ✅ **Сьогодні** (`/today`) | Чекліст задач на сьогодні (поки порожній). |

## Стек

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- Чистий CSS (`app/globals.css`), без UI-бібліотек
- Стан: `lib/useTasks.ts` (`localStorage`), без бекенду

## Локальний запуск

Потрібен **Node.js 18.18+** (рекомендовано 20 LTS).

```bash
npm install
npm run dev
```

Відкрий http://localhost:3000 — краще з увімкненим мобільним режимом у DevTools.

## Структура

```
app/
  layout.tsx        # корінь + нижня таб-навігація + viewport
  page.tsx          # редірект на /capture
  globals.css       # усі стилі, mobile-first
  capture/page.tsx  # екран «Захопити»
  inbox/page.tsx    # екран «Вхідні»
  today/page.tsx    # екран «Сьогодні»
components/
  TabBar.tsx        # нижня навігація
lib/
  types.ts          # типи задач
  useTasks.ts       # клієнтський стан + localStorage
```
