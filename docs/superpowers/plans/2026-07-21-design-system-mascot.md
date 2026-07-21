# Дизайн-система «живий мальований планер» — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевдягти застосунок AI Day Planner у теплий, яскравий, мальований стиль з маскотом — змінюючи ТІЛЬКИ дизайн, не чіпаючи наявний функціонал.

**Architecture:** Централізована дизайн-система на чистому CSS + CSS-змінних у `app/globals.css` (токени для light/dark). Спільні класи (`.task`, `.prio`, `.screen`…) перевдягають усі екрани одразу. Точкові зміни розмітки в `.tsx` (маскот, скетч-іконки) зберігають усі обробники й стани. Маскот — керований SVG-компонент зі станами через CSS-класи.

**Tech Stack:** Next.js 15 (App Router), React 19, чистий CSS (без нових залежностей на стилі; можливий один легкий icon-пакет — див. Task 4).

## Global Constraints

- **ТІЛЬКИ ДИЗАЙН.** Не змінювати логіку, стани, роутинг, обробники подій, localStorage, виклики API. Голос (Web Speech), Triage, capacity, історія, перенос невиконаного — працюють як є. Джерело: спек Розділ 0.
- Кожна зміна `.tsx` зберігає наявні `onClick`, `aria-*`, `disabled`, пропси й стани незмінними — міняється лише вигляд/розмітка обгортки.
- Токени визначаються для світлої І темної теми (`@media (prefers-color-scheme: dark)`).
- Анімації поважають `@media (prefers-reduced-motion: reduce)`.
- Жодних емодзі як **функціональних** іконок (таб-бар, дії). Скетч-набір або SVG.
- Назви пріоритетів: 🔴 Критично / 🟠 Важливо / 🟢 На десерт (EN: Critical / Important / Nice-to-do).
- Шрифт заголовків: системний округлий `ui-rounded, "SF Pro Rounded", ...` з фолбеком.
- Гілка: `design-system-mascot`. **Не пушити в `main` без явного схвалення користувача.**
- Верифікація кожної задачі: `npm run build` проходить БЕЗ помилок + візуальна перевірка потрібного екрана в `npm run dev` + перевірка, що функціонал екрана не зламано.

---

## Файлова структура (що і навіщо)

- `app/globals.css` — **головний файл змін.** Токени + вигляд усіх спільних класів. (Modify, найбільше)
- `lib/i18n.ts` — назви пріоритетів (uk + en). (Modify, 2 рядки)
- `components/Mascot.tsx` — **новий** керований SVG-маскот зі станами. (Create)
- `components/Icon.tsx` — **новий** обгортка/набір скетч-іконок (якщо обрано інлайн-SVG замість пакета). (Create або пропустити — див. Task 4)
- `components/TabBar.tsx` — заміна емодзі-іконок на скетч-іконки. (Modify)
- `app/capture/page.tsx` — маскот + стиль кнопок (мікрофон/розбір). Логіку не чіпати. (Modify розмітки)
- `app/triage/page.tsx` — маскот «зібрав план» + вигляд. Логіку не чіпати. (Modify розмітки)
- `app/today/page.tsx` — маскот у шапці + скетч-іконки замість емодзі в станах. Логіку не чіпати. (Modify розмітки)
- `docs/superpowers/design/mascot-character.md` — **новий** опис характеру маскота. (Create, Task 1)

Довідка — референс-значення токенів і компонентів уже перевірені в макеті: `scratchpad/today-direction.html` (артефакт https://claude.ai/code/artifact/952fbb17-d1d5-4b3e-9e45-3eac1c2a585d). Код нижче взято звідти.

---

### Task 1: Характер маскота (дизайн-документ)

Маскот вирішено «розробити глибше». Спершу зафіксувати особистість і стани словами — це керує реалізацією SVG у Task 6.

**Files:**
- Create: `docs/superpowers/design/mascot-character.md`

**Interfaces:**
- Produces: перелік станів маскота (рядкові ключі), які Task 6 реалізує як `state`-проп: `calm | thinking | happy | night`.

- [ ] **Step 1: Написати документ характеру**

Створити `docs/superpowers/design/mascot-character.md` з таким змістом (заповнити реальними рішеннями, не плейсхолдерами):

```markdown
# Маскот — характер

**Роль:** провідник, який знижує тривогу й супроводжує по дузі перевантаження→полегшення→старт.
**Особистість:** спокійний, теплий, підбадьорливий; не набридливий, не інфантильний.
**Ім'я:** <обрати коротке ім'я; напр. «План» / інше — узгодити з користувачем>.
**Форма:** мʼяка скетч-краплинка з очима й простим ротом (як у макеті), фіолетовий колір (--violet).

## Стани (керуються пропом `state`)
- `calm` — спокій, легке «дихання». За замовчуванням у шапці Today.
- `thinking` — під час розбору/Triage: примружені очі, крапки «...». «Я розбираю хаос».
- `happy` — задача/усі задачі виконані: широка усмішка, іскри. Святкування.
- `night` — «день закрито» (модалка кінця дня): напівзаплющені очі, місяць.

## Де зʼявляється
- Capture: присутність (запрошення «кидай усе сюди»).
- Triage: `thinking` → момент «зібрав план».
- Today: шапка (`calm`), святкування (`happy`), модалка кінця дня (`night`).
```

- [ ] **Step 2: Узгодити ім'я з користувачем**

Поставити користувачу коротке питання: як назвати маскота (запропонувати 2-3 варіанти). Вписати відповідь у документ.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/design/mascot-character.md
git commit -m "Дизайн: характер і стани маскота"
```

---

### Task 2: Токени дизайн-системи в globals.css

Фундамент. Замінити поточний `:root` блок (кольори) на розширену палітру + типографіку + простір + радіуси + рух, для light і dark.

**Files:**
- Modify: `app/globals.css:1-27` (поточні `:root` та dark-блок)

**Interfaces:**
- Produces: CSS-змінні, якими користуються всі наступні задачі:
  `--bg, --panel, --ink, --ink-soft, --line, --accent, --accent-ink, --violet, --violet-soft, --hi, --hi-bg, --mid, --mid-bg, --lo, --lo-bg, --paper, --shadow, --sketch, --f-round, --f-body`
  плюс наявні `--tabbar-height, --safe-bottom` (зберегти!).

- [ ] **Step 1: Замінити блок токенів**

У `app/globals.css` замінити рядки 1–27 (обидва `:root` і `@media dark`) на (значення перевірені в макеті):

```css
:root {
  --bg:#FFF7EE; --panel:#FFFFFF; --ink:#2C2438; --ink-soft:#6E6480;
  --line:#EBDFCF; --accent:#FF6A3D; --accent-ink:#7A2A12;
  --violet:#7C5CFC; --violet-soft:#EFEAFF;
  --hi:#FF5A5F; --hi-bg:#FFE7E7; --mid:#FF9F1C; --mid-bg:#FFF0D6;
  --lo:#12B5A5; --lo-bg:#DCF6F2; --paper:#FFFDF8; --shadow:rgba(44,36,56,.10);
  --sketch:#2C2438;
  --f-round: ui-rounded, "SF Pro Rounded", "Nunito", -apple-system, system-ui, sans-serif;
  --f-body: -apple-system, "Segoe UI", system-ui, sans-serif;

  /* аліаси на наявні імена, щоб не переписувати весь файл одразу */
  --surface: var(--paper);
  --text: var(--ink);
  --text-muted: var(--ink-soft);
  --border: var(--line);
  --accent-contrast: #ffffff;
  --danger: var(--hi);

  --tabbar-height: 68px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:#1C1726; --panel:#241E30; --ink:#F3EEFB; --ink-soft:#A99FC0;
    --line:#382F49; --accent:#FF7E57; --accent-ink:#FFE3D6;
    --violet:#9E86FF; --violet-soft:#2E2646;
    --hi:#FF7275; --hi-bg:#3A2029; --mid:#FFB74D; --mid-bg:#3A2E1C;
    --lo:#3AD0C0; --lo-bg:#123331; --paper:#2A2337; --shadow:rgba(0,0,0,.4);
    --sketch:#F3EEFB;
    --surface: var(--paper);
    --text: var(--ink);
    --text-muted: var(--ink-soft);
    --border: var(--line);
    --accent-contrast: #ffffff;
    --danger: var(--hi);
  }
}
```

Примітка: аліаси (`--surface`, `--text`, `--text-muted`, `--border`, `--danger`, `--accent-contrast`) зберігають сумісність із рештою CSS, який ще використовує старі імена. Це дозволяє впроваджувати вигляд поступово, не ламаючи екрани.

- [ ] **Step 2: Застосувати шрифти й тепле тло до body**

Знайти правило `body {` (≈рядок 40) і додати всередину (не видаляючи наявного):

```css
  font-family: var(--f-body);
  background:
    radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--violet) 7%, transparent), transparent 40%),
    radial-gradient(circle at 90% 85%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 45%),
    var(--bg);
```

(Замінити наявні `background: var(--bg);` та `font-family: ...` на ці рядки.)

- [ ] **Step 3: Заголовки — округлий шрифт**

Знайти `.screen__title` (≈рядок 102) і додати `font-family: var(--f-round);`.

- [ ] **Step 4: Верифікація**

```bash
npm run build
```
Expected: збірка успішна, без помилок. Тоді `npm run dev`, відкрити `/today` і `/capture` — фон теплий, заголовки округлі, нічого не «поламалось» у розкладці.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "Дизайн-токени: тепла яскрава палітра + округлі заголовки (light/dark)"
```

---

### Task 3: Назви пріоритетів (i18n)

**Files:**
- Modify: `lib/i18n.ts:117` (uk `prio`), і відповідний рядок en `prio` (пошук `prio: { low: "low"`).

**Interfaces:**
- Consumes: наявні класи `.prio--high/.prio--medium/.prio--low` (вигляд задає Task 5).

- [ ] **Step 1: Замінити українські назви**

У `lib/i18n.ts` рядок `prio: { low: "низький", medium: "середній", high: "високий" }` замінити на:

```ts
  prio: { low: "на десерт", medium: "важливо", high: "критично" },
```

- [ ] **Step 2: Замінити англійські назви**

Знайти `prio: { low: "low", medium: "medium", high: "high" }` і замінити на:

```ts
  prio: { low: "nice-to-do", medium: "important", high: "critical" },
```

- [ ] **Step 3: Верифікація**

```bash
npm run build
```
Expected: успішно. У `npm run dev` на `/today` і `/triage` теги задач показують нові назви обома мовами (перемкнути мову).

- [ ] **Step 4: Commit**

```bash
git add lib/i18n.ts
git commit -m "Назви пріоритетів: критично / важливо / на десерт"
```

---

### Task 4: Скетч-іконки (набір + таб-бар)

Замінити емодзі-іконки таб-бару на скетч-іконки. Спершу — рішення про джерело.

**Files:**
- Modify: `components/TabBar.tsx:11-15, 28-30`
- (Опційно) Create: `components/Icon.tsx`

**Interfaces:**
- Produces: спосіб рендерити іконку за назвою: `capture | inbox | today` (для таб-бару). Пізніші задачі можуть додати `history`, `mic`, `send`.

- [ ] **Step 1: Обрати джерело іконок**

Перевірити ліцензію/вагу вільного скетч-набору (напр. рукописний/«hand-drawn» набір). Критерії: вільна ліцензія (MIT/CC0), можливість інлайн-SVG або легкий tree-shakeable пакет, консистентний скетч-стиль. Якщо відповідного немає — зробити власні мінімальні інлайн-SVG у `components/Icon.tsx`. Зафіксувати вибір коментарем у `Icon.tsx`.

- [ ] **Step 2: Створити компонент іконок (варіант інлайн-SVG)**

Створити `components/Icon.tsx` з keyed-набором SVG (скетч-стиль, `stroke: currentColor`, `fill: none`):

```tsx
type IconName = "capture" | "inbox" | "today" | "history";
export default function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "capture": return (<svg {...common}><path d="M4 20l3-.7L18.5 7.8a2 2 0 0 0-2.8-2.8L4.2 16.5 4 20z"/><path d="M14.5 6.5l3 3"/></svg>);
    case "inbox":   return (<svg {...common}><path d="M4 13l2.5-7h11L20 13"/><path d="M4 13h5l1.5 3h3L14 13h6v5H4z"/></svg>);
    case "today":   return (<svg {...common}><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>);
    case "history": return (<svg {...common}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>);
  }
}
```

- [ ] **Step 3: Підключити в таб-барі**

У `components/TabBar.tsx`:
1. Додати `import Icon from "@/lib/../components/Icon";` (шлях відповідно до `@/`, тобто `import Icon from "@/components/Icon";`).
2. Замінити масив `tabs` — прибрати `icon: "..."` рядки, додати ключ `key`:

```tsx
  const tabs = [
    { href: "/capture", label: t.tab.capture, icon: "capture" as const },
    { href: "/inbox", label: t.tab.inbox, icon: "inbox" as const },
    { href: "/today", label: t.tab.today, icon: "today" as const },
  ];
```
3. Замінити `<span className="tabbar__icon" aria-hidden>{tab.icon}</span>` на:

```tsx
            <span className="tabbar__icon" aria-hidden>
              <Icon name={tab.icon} />
            </span>
```

- [ ] **Step 4: Верифікація**

```bash
npm run build
```
Expected: успішно. У `dev` таб-бар показує скетч-іконки; активна вкладка підсвічена (клас `--active` не чіпали); навігація працює.

- [ ] **Step 5: Commit**

```bash
git add components/Icon.tsx components/TabBar.tsx
git commit -m "Скетч-іконки в таб-барі замість емодзі"
```

---

### Task 5: Стікер-задача (вигляд .task та дочірніх)

Найпомітніший компонент. Перевдягти спільні класи `.task`, `.task__title`, `.task__meta`, `.prio`, `.cat`, `.task__check`, `.task__defer`, `.task__add`, `.badge`, `.chip-edit`. Використовується на Today, Triage, Inbox — усі перевдягнуться одразу.

**Files:**
- Modify: `app/globals.css` (правила `.task*`, `.prio*`, `.cat*` — знайти наявні секції)

**Interfaces:**
- Consumes: токени з Task 2.

- [ ] **Step 1: Замінити правила стікера-задачі**

Знайти наявні правила `.task {`, `.task__meta`, `.prio` тощо і замінити їхній вигляд на (структура з макета, адаптована під наявні класи):

```css
.task {
  display: flex; align-items: center; gap: 12px;
  background: var(--panel);
  border: 2px solid var(--sketch);
  border-radius: 255px 16px 235px 16px / 16px 235px 16px 255px;
  padding: 12px 13px;
  box-shadow: 3px 4px 0 var(--tint, var(--line));
  position: relative;
}
.task--high { --tint: var(--hi-bg); }
.task--medium { --tint: var(--mid-bg); }
.task--low { --tint: var(--lo-bg); }
.task::before {
  content: ""; position: absolute; left: 0; top: 10px; bottom: 10px;
  width: 5px; border-radius: 99px; background: var(--stripe, var(--line));
}
.task--high::before { background: var(--hi); }
.task--medium::before { background: var(--mid); }
.task--low::before { background: var(--lo); }
.task__title { font-family: var(--f-round); font-weight: 700; font-size: 15px; line-height: 1.2; }
.task__meta { display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap; }
.prio { font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: 99px; }
.prio--high { color: var(--hi); background: var(--hi-bg); }
.prio--medium { color: var(--mid); background: var(--mid-bg); }
.prio--low { color: var(--lo); background: var(--lo-bg); }
```

Примітка: якщо наявний код використовує клас пріоритету у форматі `prio--high` — звірити з реальними значеннями `task.priority` (`high|medium|low`) у `today/page.tsx` (рядок `prio prio--${task.priority}`). Класи мають збігатися.

- [ ] **Step 2: Чекбокс і кнопки-дії — стиль**

Знайти `.task__check`, `.task__defer` і привести до скетч-стилю (зберегти розміри тап-зони ≥26px):

```css
.task__check {
  width: 26px; height: 26px; flex: 0 0 auto; margin-left: 4px;
  border-radius: 9px; border: 2.5px solid var(--sketch); background: transparent;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.task__check--done { background: var(--lo); border-color: var(--lo); }
.task__title--done { color: var(--ink-soft); text-decoration: line-through; }
```

- [ ] **Step 3: Верифікація**

```bash
npm run build
```
Expected: успішно. У `dev` на `/today`: задачі — стікери з нерівними кутами, кольоровою смужкою пріоритету й «олівцевою» тінню. Клік по чекбоксу перемикає «виконано» (функціонал!). На `/triage` задачі теж перевдягнені.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "Стікер-задача: нерівні кути, кольорова смужка пріоритету, олівцева тінь"
```

---

### Task 6: Компонент маскота (Mascot.tsx)

**Files:**
- Create: `components/Mascot.tsx`

**Interfaces:**
- Consumes: стани з Task 1 (`calm | thinking | happy | night`), токен `--violet`, `--sketch`, `--accent`.
- Produces: `<Mascot state="calm" size={60} />` — використовують Tasks 7-9.

- [ ] **Step 1: Створити компонент**

Створити `components/Mascot.tsx`. Базова форма — з макета; стани керують дрібними деталями (очі/рот) через проп. `prefers-reduced-motion` вимикає «дихання».

```tsx
type MascotState = "calm" | "thinking" | "happy" | "night";
export default function Mascot({ state = "calm", size = 60 }: { state?: MascotState; size?: number }) {
  const mouth =
    state === "happy" ? "M40 60 Q51 74 62 59" :
    state === "night" ? "M43 64 Q51 68 60 64" :
    "M43 62 Q51 70 60 61";
  return (
    <svg className={`mascot mascot--${state}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <ellipse cx="50" cy="93" rx="26" ry="5" fill="var(--shadow)"/>
      <path d="M24 52 C22 30 40 16 50 16 C60 16 78 30 76 52 C74 74 62 84 50 84 C38 84 26 74 24 52 Z"
        fill="var(--violet)" stroke="var(--sketch)" strokeWidth="3"/>
      <path d="M40 22 C36 12 30 12 30 12" fill="none" stroke="var(--sketch)" strokeWidth="3" strokeLinecap="round"/>
      {state === "night" ? (
        <>
          <path d="M38 50 q4 3 8 0" fill="none" stroke="var(--sketch)" strokeWidth="3" strokeLinecap="round"/>
          <path d="M56 50 q4 3 8 0" fill="none" stroke="var(--sketch)" strokeWidth="3" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="42" cy="50" r="4.5" fill="#fff"/><circle cx="43" cy="51" r="2.3" fill="var(--sketch)"/>
          <circle cx="60" cy="50" r="4.5" fill="#fff"/><circle cx="61" cy="51" r="2.3" fill="var(--sketch)"/>
        </>
      )}
      <path d={mouth} fill="none" stroke="var(--sketch)" strokeWidth="3" strokeLinecap="round"/>
      {state === "thinking" && (
        <g fill="var(--ink-soft)"><circle cx="80" cy="30" r="2.5"/><circle cx="87" cy="26" r="2"/></g>
      )}
      {state === "happy" && (
        <g fill="var(--accent)" opacity=".6"><circle cx="34" cy="60" r="4"/><circle cx="68" cy="60" r="4"/></g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Стилі маскота в globals.css**

Додати в `app/globals.css`:

```css
.mascot { display: block; transform-origin: 50% 90%; }
.mascot--calm { animation: mascot-bob 4s ease-in-out infinite; }
@keyframes mascot-bob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-4px) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .mascot { animation: none !important; } }
```

- [ ] **Step 3: Верифікація**

```bash
npm run build
```
Expected: успішно (компонент ще ніде не використаний — просто компілюється).

- [ ] **Step 4: Commit**

```bash
git add components/Mascot.tsx app/globals.css
git commit -m "Компонент маскота зі станами (calm/thinking/happy/night)"
```

---

### Task 7: Перевдяг Capture (маскот + кнопки)

**Files:**
- Modify: `app/capture/page.tsx` (лише розмітка), `app/globals.css` (`.parse-btn`, `.mic-btn`)

**Interfaces:**
- Consumes: `Mascot` (Task 6). **Не чіпати:** `handleParse`, `toggleMic`, стани `phase/listening/micSupported`, роутинг.

- [ ] **Step 1: Додати присутність маскота**

У `app/capture/page.tsx` всередині `<div className="capture">`, ПЕРЕД `<textarea>`, додати блок-запрошення (новий, нічого не видаляти):

```tsx
        <div className="capture__hello">
          <Mascot state="calm" size={64} />
          <p className="capture__invite">{t.capture.hintEmpty}</p>
        </div>
```

Додати імпорт угорі: `import Mascot from "@/components/Mascot";`

- [ ] **Step 2: Стилі кнопок і привітання**

У `app/globals.css` оновити `.parse-btn` (округла тепла головна кнопка) і додати `.mic-btn`, `.capture__hello`:

```css
.parse-btn {
  width: 100%; min-height: 60px; border: none; border-radius: 18px;
  background: var(--accent); color: #fff; font-family: var(--f-round);
  font-size: 18px; font-weight: 800;
  box-shadow: 0 10px 22px -8px color-mix(in srgb, var(--accent) 70%, transparent);
  transition: transform .08s ease, opacity .15s ease;
}
.parse-btn:active { transform: scale(0.98); }
.parse-btn:disabled { opacity: .5; box-shadow: none; }
.mic-btn {
  width: 100%; min-height: 48px; border: 2px solid var(--sketch); border-radius: 14px;
  background: transparent; color: var(--ink); font-family: var(--f-round); font-weight: 700; font-size: 15px;
}
.mic-btn--on { background: var(--violet-soft); border-color: var(--violet); color: var(--violet); }
.capture__hello { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.capture__invite { margin: 0; color: var(--ink-soft); font-size: 14px; font-weight: 600; }
```

- [ ] **Step 3: Верифікація (включно з функціоналом!)**

```bash
npm run build
```
Expected: успішно. У `dev` на `/capture`:
- Маскот присутній, кнопки в новому стилі.
- **Функціонал цілий:** ввести текст → «Розібрати» → перехід на `/triage` (або `/today`); кнопка мікрофона зʼявляється, якщо браузер підтримує, і починає/зупиняє диктування; помилка показує банер.

- [ ] **Step 4: Commit**

```bash
git add app/capture/page.tsx app/globals.css
git commit -m "Перевдяг Capture: маскот + теплі кнопки (логіку не чіпано)"
```

---

### Task 8: Перевдяг Triage (момент «зібрав план»)

**Files:**
- Modify: `app/triage/page.tsx` (лише розмітка шапки)

**Interfaces:**
- Consumes: `Mascot` (Task 6), перевдягнені `.task` (Task 5). **Не чіпати:** `finish`, `moveToToday`, `cycleEstimate`, логіку `batchIds/empty`.

- [ ] **Step 1: Режисований заголовок з маскотом**

У `app/triage/page.tsx` замінити блок заголовка (рядки з `<h1 className="screen__title">` та `<p className="screen__subtitle">`) на:

```tsx
      <div className="triage__hero">
        <Mascot state="thinking" size={72} />
        <div>
          <h1 className="screen__title">{t.triage.title}</h1>
          <p className="screen__subtitle">{t.triage.subtitle}</p>
        </div>
      </div>
```

Додати імпорт: `import Mascot from "@/components/Mascot";`

- [ ] **Step 2: Стиль hero**

Додати в `app/globals.css`:

```css
.triage__hero { display: flex; align-items: center; gap: 14px; margin: 4px 0 18px; }
.triage__hero .screen__subtitle { margin: 2px 0 0; }
.triage__hero .screen__title { margin: 0; }
```

- [ ] **Step 3: Верифікація**

```bash
npm run build
```
Expected: успішно. У `dev`: пройти Capture→Triage, маскот `thinking` у шапці, задачі — стікери; кнопка «додати в Today» переносить задачу (функціонал!), «готово» веде на Today.

- [ ] **Step 4: Commit**

```bash
git add app/triage/page.tsx app/globals.css
git commit -m "Перевдяг Triage: маскот 'зібрав план' (логіку не чіпано)"
```

---

### Task 9: Перевдяг Today (шапка, стани, прогрес, capacity)

**Files:**
- Modify: `app/today/page.tsx` (розмітка шапки + заміна емодзі в станах), `app/globals.css` (`.progress`, `.capacity`, `.celebrate`, `.modal`, `.empty`)

**Interfaces:**
- Consumes: `Mascot` (Task 6). **Не чіпати:** `toggleDone`, `moveToInbox`, `cycleEstimate`, `endDay`, `finishDay`, стани, сортування.

- [ ] **Step 1: Маскот у шапці + у станах**

У `app/today/page.tsx`:
- Додати імпорт `import Mascot from "@/components/Mascot";`.
- У `.screen__head` додати `<Mascot state={allDone ? "happy" : "calm"} size={52} />` поруч із заголовком (не видаляючи наявних елементів).
- Замінити емодзі-стани на маскота: у блоці `celebrate` `🎉` → `<Mascot state="happy" size={64} />`; у модалці кінця дня іконку `{unfinished === 0 ? "🎉" : "🌙"}` → `<Mascot state={unfinished === 0 ? "happy" : "night"} size={56} />`; у порожньому стані `👋` → `<Mascot state="calm" size={64} />`.

- [ ] **Step 2: Прогрес — теплий градієнт; capacity/celebrate/modal — стиль**

У `app/globals.css` оновити:

```css
.progress__fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--violet), var(--accent)); transition: width .35s ease; }
.progress__label { font-family: var(--f-round); font-weight: 800; }
.capacity { margin-bottom: 18px; padding: 14px 16px; border-radius: 18px; background: var(--paper); border: 2px solid var(--line); }
.capacity--over { border-color: var(--hi); }
.capacity__fill { background: var(--lo); }
.capacity--over .capacity__fill { background: var(--hi); }
```

- [ ] **Step 3: Верифікація (функціонал!)**

```bash
npm run build
```
Expected: успішно. У `dev` на `/today`:
- Маскот у шапці; прогрес теплий; capacity/стани в новому стилі.
- **Функціонал цілий:** чекбокс перемикає done; «↩» переносить в Inbox; редагування часу тапом; «Завершити день» відкриває модалку; кнопки переносу/в inbox працюють; святкування при всіх виконаних.
- Немає емодзі як іконок.

- [ ] **Step 4: Commit**

```bash
git add app/today/page.tsx app/globals.css
git commit -m "Перевдяг Today: маскот у шапці й станах, теплий прогрес (логіку не чіпано)"
```

---

### Task 10: Наскрізна перевірка якості

**Files:** (перевірка, за потреби дрібні правки в `app/globals.css`)

- [ ] **Step 1: Обидві теми**

У `dev` перемкнути системну тему (світла/темна) і пройти Capture→Triage→Today, Inbox, History. Кожен екран читабельний, контраст ок, кольори пріоритетів помітні в обох темах.

- [ ] **Step 2: Reduced motion**

Увімкнути «зменшити рух» у системі — маскот не «дихає», переходи не заважають.

- [ ] **Step 3: Функціональний регрес-чек (нічого не зламано)**

Пройти повний сценарій: вивалити текст → розбір → Triage (додати/готово) → Today (виконати, перенести, редагувати час, завершити день з переносом і без) → Inbox → History. Голосовий ввід (якщо підтримується). Перемикач мови. Усе працює як до редизайну.

- [ ] **Step 4: Фінальна збірка**

```bash
npm run build
```
Expected: успішно, без ворнінгів про хуки/типи, доданих нами.

- [ ] **Step 5: Commit (якщо були правки)**

```bash
git add -A
git commit -m "QA: обидві теми, reduced-motion, регрес функціоналу"
```

---

## Self-Review (звірка плану зі спеком)

**Покриття спека:**
- Токени (колір/типографіка/простір/радіуси/рух/мальований шар) → Task 2, 5, 6 (радіуси/тінь стікера), 6 (рух).
- Компоненти: маскот → Task 1+6; стікер → Task 5; кнопки → Task 7; скетч-іконки → Task 4; прогрес/capacity → Task 9; сцени (порожній/магія/святкування) → Tasks 7-9.
- Назви пріоритетів → Task 3.
- Перевдяг Capture/Today/Triage → Tasks 7/9/8. Inbox/History підхоплюють токени (Task 2/5) → перевірка в Task 10.
- Правило «тільки дизайн» → Global Constraints + верифікація функціоналу в кожній задачі + Task 10 регрес.
- Обидві теми + reduced-motion → Task 2/6 + Task 10.

**Плейсхолдери:** єдиний свідомий відкритий пункт — ім'я маскота (Task 1, Step 2) і вибір icon-набору (Task 4, Step 1) — обидва вирішуються всередині задачі з користувачем, не лишаються «TODO» в коді.

**Узгодженість типів/класів:** класи пріоритету `high|medium|low` звірено з `today/page.tsx`/`triage/page.tsx` (`prio--${task.priority}`); стани маскота однакові в Task 1/6/7/8/9; проп `Mascot` (`state`, `size`) стабільний.
