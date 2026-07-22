# Inbox Category Filters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single-select category filter chip row above the Inbox task list so the user can view one род діяльності at a time.

**Architecture:** Purely client-side, visual-only filtering in `app/inbox/page.tsx` using local `useState`. No changes to `useTasks`/data model. Chips render only for categories present in the current Inbox, with counts, in the fixed `CATEGORIES` order. Styling reuses existing design tokens.

**Tech Stack:** Next.js 15.5 (App Router), React 19, TypeScript, plain CSS. No test runner in the project.

## Global Constraints

- **UI language:** interface strings are Ukrainian + English ONLY. Never Russian. Filter reset label = UA **«Всі»**, EN **«All»** (NOT Russian «Все»).
- **Verification (no unit-test runner exists):** each task's gate is `npm run build` → exit 0, then `npm run lint` → no new errors, plus manual browser check where noted. Build before any push (project rule).
- **Node:** no system Node on this machine. Install portable LTS into the session scratchpad and `export PATH="<scratchpad>/node-v24.x-darwin-arm64/bin:$PATH"` before any `npm` command (see `docs/HANDOFF.md` → «Локальний білд»).
- **Commits/push:** the agent commits locally only. The owner pushes via GitHub Desktop. Never push.
- **Scope:** single-select; only present categories; visual-only. No priority filter, no Today filters, no persistence (YAGNI).
- **Design tokens to reuse:** `--accent`, `--accent-contrast`, `--sketch`, `--panel`, `--text`, `--text-muted`, `--f-round`. Match the existing category-pill look (`.cat--*`).

---

## Prerequisite: clean the working tree

Two files this plan edits (`lib/i18n.ts`, `app/globals.css`) already carry **uncommitted changes from the previous session** (the «перенос на завтра» / redirect-to-Today / category-tag-on-Today work — see `docs/HANDOFF.md` → «НЕЗАКОМІЧЕНІ ПРАВКИ»). Commit that work as its own focused commit FIRST, so filter commits stay clean.

> ⚠️ Requires the owner's go-ahead (she pushes). Confirm before committing her pending work.

- [ ] **P1: Set up portable Node** (per `docs/HANDOFF.md`); then `export PATH=...` so `node -v` prints a version.

- [ ] **P2: Build-verify the pending work**

Run: `cd /Users/anastasiakozaruk/Documents/Claude/Skelar && npm run build`
Expected: `exit 0` (compiled successfully). If it fails, fix the error before committing.

- [ ] **P3: Commit the pending work as one focused commit**

```bash
git add app/capture/page.tsx app/today/page.tsx app/globals.css \
        lib/i18n.ts lib/types.ts lib/useTasks.ts
git commit -m "$(cat <<'EOF'
Фічі: перенос на завтра + редірект на Today + тег категорії на Today

- після розбору відкриваємо «Сьогодні» (а не Вхідні)
- тег категорії тепер і в списку «Сьогодні»
- справжній перенос на завтра через scheduledFor (секція 🌙 Завтра),
  наступного дня задача сама стає сьогоднішньою

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

Expected: `git status` now shows a clean tree (only untracked `docs/` files remain). Ask the owner to **Push origin** in GitHub Desktop.

---

## Task 1: i18n string «Всі» / «All»

**Files:**
- Modify: `lib/i18n.ts` (interface `Strings.inbox`; `uk.inbox`; `en.inbox`)

**Interfaces:**
- Produces: `t.inbox.all` (string) — consumed by Task 2.

- [ ] **Step 1: Add `all` to the `Strings.inbox` interface**

In `lib/i18n.ts`, the `inbox` block of `interface Strings` becomes:

```ts
  inbox: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyText: string;
    cta: string;
    add: string;
    badge: string;
    all: string;
  };
```

- [ ] **Step 2: Add the Ukrainian value** (`const uk`, `inbox` object) — add after `badge`:

```ts
    badge: "✨ Раджу на сьогодні",
    all: "Всі",
```

- [ ] **Step 3: Add the English value** (`const en`, `inbox` object) — add after `badge`:

```ts
    badge: "✨ Suggested for today",
    all: "All",
```

- [ ] **Step 4: Build to verify types**

Run: `npm run build`
Expected: `exit 0`. (A missing value in either `uk`/`en` would be a TS error — this proves both are present.)

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.ts
git commit -m "$(cat <<'EOF'
i18n: рядок «Всі»/«All» для фільтра Вхідних

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Filter chip row (Inbox page + CSS)

**Files:**
- Modify: `app/inbox/page.tsx` (full rewrite of the component)
- Modify: `app/globals.css` (append filter-chip styles at end of file)

**Interfaces:**
- Consumes: `t.inbox.all` (Task 1); `CATEGORIES`, `Category` from `@/lib/types`; CSS classes `.inbox-filters`, `.filter-chip`, `.filter-chip--active`, `.filter-chip__count`.
- Produces: user-facing feature; nothing consumed downstream.

- [ ] **Step 1: Append filter-chip CSS at the END of `app/globals.css`**

```css

/* ---- Фільтри Вхідних (чипи за категорією) ---- */
.inbox-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 12px;
  margin: 2px 0 4px;
  scrollbar-width: none;
}
.inbox-filters::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 5px 13px;
  border: 2px solid var(--sketch);
  border-radius: 999px;
  background: var(--panel);
  color: var(--text);
  font-family: var(--f-round);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.filter-chip__count {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-muted);
}

.filter-chip--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-contrast);
}
.filter-chip--active .filter-chip__count {
  color: var(--accent-contrast);
}

@media (hover: hover) {
  .filter-chip:hover {
    border-color: var(--accent);
    cursor: pointer;
  }
}
```

- [ ] **Step 2: Rewrite `app/inbox/page.tsx`** with the filter state, chip row, filtering, and auto-reset. Full file:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";

type Filter = Category | "all";

export default function InboxPage() {
  const { inbox, loaded, moveToToday, toggleDone, cycleEstimate } = useTasks();
  const { t } = useLang();

  const [filter, setFilter] = useState<Filter>("all");

  // Категорії, що реально присутні у Вхідних (сталий порядок) + лічильники.
  const present = useMemo(
    () => CATEGORIES.filter((c) => inbox.some((task) => task.category === c)),
    [inbox]
  );
  const counts = useMemo(() => {
    const map = {} as Record<Category, number>;
    for (const task of inbox) {
      map[task.category] = (map[task.category] ?? 0) + 1;
    }
    return map;
  }, [inbox]);

  // Якщо вибрана категорія зникла зі списку — авто-скидання на «Всі».
  useEffect(() => {
    if (filter !== "all" && !present.includes(filter)) {
      setFilter("all");
    }
  }, [present, filter]);

  const visible =
    filter === "all" ? inbox : inbox.filter((task) => task.category === filter);

  return (
    <main className="screen">
      <h1 className="screen__title">{t.inbox.title}</h1>
      <p className="screen__subtitle">{t.inbox.subtitle}</p>

      {loaded && inbox.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            📥
          </span>
          <span className="empty__title">{t.inbox.emptyTitle}</span>
          <span className="empty__text">{t.inbox.emptyText}</span>
          <Link href="/capture" className="cta">
            {t.inbox.cta}
          </Link>
        </div>
      ) : (
        <>
          {inbox.length > 0 && (
            <div className="inbox-filters">
              <button
                type="button"
                className={`filter-chip${filter === "all" ? " filter-chip--active" : ""}`}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                {t.inbox.all}
                <span className="filter-chip__count">{inbox.length}</span>
              </button>
              {present.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`filter-chip${filter === c ? " filter-chip--active" : ""}`}
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                >
                  {t.cat[c]}
                  <span className="filter-chip__count">{counts[c]}</span>
                </button>
              ))}
            </div>
          )}

          <ul className="task-list">
            {visible.map((task) => (
              <li
                key={task.id}
                className={`task task--${task.priority}${task.suggested ? " task--suggested" : ""}`}
              >
                <button
                  type="button"
                  className="task__check"
                  onClick={() => toggleDone(task.id)}
                  aria-label="Done"
                />
                <div className="task__body">
                  <span className="task__title">{task.title}</span>
                  <span className="task__meta">
                    <span className={`cat cat--${task.category}`}>
                      {t.cat[task.category]}
                    </span>
                    <span className={`prio prio--${task.priority}`}>
                      {t.prio[task.priority]}
                    </span>
                    <button
                      type="button"
                      className="chip-edit"
                      onClick={() => cycleEstimate(task.id)}
                      aria-label={t.meta.editTimeHint}
                      title={t.meta.editTimeHint}
                    >
                      {task.estimateMin != null
                        ? t.meta.min(task.estimateMin)
                        : t.meta.setTime}
                    </button>
                    {task.deadline && <span>{t.meta.due(task.deadline)}</span>}
                    {task.suggested && (
                      <span className="badge">{t.inbox.badge}</span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="task__add"
                  onClick={() => moveToToday(task.id)}
                  aria-label={t.inbox.add}
                >
                  {t.inbox.add}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `exit 0`.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors/warnings for `app/inbox/page.tsx`.

- [ ] **Step 5: Manual browser check** (`npm run dev`, open on a phone-sized viewport)

Verify:
1. With mixed-category Inbox tasks, a chip row shows «Всі» + only present categories, each with a correct count.
2. Tapping a category chip shows only that category and highlights the chip; «Всі» resets.
3. Moving the last task of the active category to Today (or marking done) makes that chip disappear and the view falls back to «Всі».
4. Empty Inbox → no chip row, existing empty state shows.
5. Labels read Ukrainian «Всі» / English «All» after toggling language — never Russian.

- [ ] **Step 6: Commit**

```bash
git add app/inbox/page.tsx app/globals.css
git commit -m "$(cat <<'EOF'
Фільтри у «Вхідних»: чипи за категорією (одиночний вибір)

Ряд чипів над списком: «Всі» + лише присутні категорії з лічильниками,
візуальний фільтр без змін моделі даних, авто-скидання коли категорія зникла.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

Then ask the owner to **Push origin** in GitHub Desktop.

---

## Self-Review Notes

- **Spec coverage:** chip row above list ✓ (T2); «Всі» + present-only with counts ✓ (T2); single-select + reset ✓ (T2); visual-only/no data change ✓ (T2); auto-reset on category disappear ✓ (T2 effect); hidden when Inbox empty ✓ (T2 `inbox.length > 0` guard); UA «Всі»/EN «All» ✓ (T1); 3 files touched ✓; build+manual verification ✓.
- **Types:** `Filter = Category | "all"`; `present: Category[]`; `counts: Record<Category, number>` — consistent across the file.
- **No placeholders:** all steps carry full code/commands.
