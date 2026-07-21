import type { Category, Priority } from "./types";

export type Lang = "uk" | "en";

export interface Strings {
  tab: { capture: string; inbox: string; today: string };
  capture: {
    placeholder: string;
    sort: string;
    sorting: string;
    hintEmpty: string;
    hintFilled: string;
    error: string;
    retry: string;
  };
  inbox: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyText: string;
    cta: string;
    add: string;
    badge: string;
  };
  today: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyText: string;
    cta: string;
    celebrateTitle: string;
  };
  prio: Record<Priority, string>;
  cat: Record<Category, string>;
  meta: {
    min: (n: number) => string;
    due: (d: string) => string;
    setTime: string;
  };
  progress: (done: number, total: number) => string;
  celebrateText: (n: number) => string;
  capacity: {
    label: string;
    over: string;
    noEstimate: (n: number) => string;
    fmt: (min: number) => string;
  };
}

const uk: Strings = {
  tab: { capture: "Захопити", inbox: "Вхідні", today: "Сьогодні" },
  capture: {
    placeholder: "Що в голові?",
    sort: "✨ Розібрати на задачі",
    sorting: "Розбираю на задачі…",
    hintEmpty: "Вивали все — AI перетворить це на структуровані задачі",
    hintFilled: "AI розкладе це на задачі з пріоритетом і дедлайнами",
    error: "Не вдалося звʼязатися з AI. Перевір інтернет і спробуй ще раз.",
    retry: "Повторити",
  },
  inbox: {
    title: "Вхідні",
    subtitle: "Розпарсені задачі, які ще не заплановані",
    emptyTitle: "Поки порожньо",
    emptyText:
      "Захопи думки на екрані «Захопити» — розпарсені задачі зʼявляться тут.",
    cta: "✍️ Захопити щось",
    add: "+ Сьогодні",
    badge: "✨ Раджу на сьогодні",
  },
  today: {
    title: "Сьогодні",
    subtitle: "Чекліст задач на сьогодні",
    emptyTitle: "Сплануймо твій день",
    emptyText:
      "Поки нічого не заплановано. Вивали, що в голові — задачі на сьогодні зʼявляться тут чеклістом.",
    cta: "✍️ Почати захоплювати",
    celebrateTitle: "Ти закрив усі задачі на сьогодні!",
  },
  prio: { low: "низький", medium: "середній", high: "високий" },
  cat: {
    work: "робота",
    sport: "спорт",
    leisure: "дозвілля",
    family: "сімʼя",
    chores: "побут",
    other: "інше",
  },
  meta: { min: (n) => `${n} хв`, due: (d) => `до ${d}`, setTime: "⏱ час?" },
  progress: (done, total) => `${done} / ${total} виконано`,
  celebrateText: (n) => `${n} ${n === 1 ? "задача" : "задач"} виконано сьогодні. Красуня!`,
  capacity: {
    label: "Навантаження дня",
    over: "Перебір — підріж або перенеси щось на завтра",
    noEstimate: (n) => `${n} без оцінки часу`,
    fmt: (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (h && m) return `${h} год ${m} хв`;
      if (h) return `${h} год`;
      return `${m} хв`;
    },
  },
};

const en: Strings = {
  tab: { capture: "Capture", inbox: "Inbox", today: "Today" },
  capture: {
    placeholder: "What's on your mind?",
    sort: "✨ Sort into tasks",
    sorting: "Sorting into tasks…",
    hintEmpty: "Dump everything — AI turns it into structured tasks",
    hintFilled: "AI will split this into tasks with priority & deadlines",
    error: "Couldn't reach the AI. Check your connection and try again.",
    retry: "Retry",
  },
  inbox: {
    title: "Inbox",
    subtitle: "Parsed tasks that aren't scheduled yet",
    emptyTitle: "Nothing here yet",
    emptyText:
      "Dump your thoughts on the Capture screen — parsed tasks will land here.",
    cta: "✍️ Capture something",
    add: "+ Today",
    badge: "✨ Suggested for today",
  },
  today: {
    title: "Today",
    subtitle: "Your checklist for today",
    emptyTitle: "Let's plan your day",
    emptyText:
      "Nothing scheduled yet. Dump what's on your mind and your tasks for today will show up here as a checklist.",
    cta: "✍️ Start capturing",
    celebrateTitle: "You hit all your tasks for today!",
  },
  prio: { low: "low", medium: "medium", high: "high" },
  cat: {
    work: "work",
    sport: "sport",
    leisure: "leisure",
    family: "family",
    chores: "chores",
    other: "other",
  },
  meta: { min: (n) => `${n} min`, due: (d) => `due ${d}`, setTime: "⏱ time?" },
  progress: (done, total) => `${done} / ${total} done`,
  celebrateText: (n) => `${n} ${n === 1 ? "task" : "tasks"} done today. Nice work.`,
  capacity: {
    label: "Day load",
    over: "Overbooked — trim or move something to tomorrow",
    noEstimate: (n) => `${n} without an estimate`,
    fmt: (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (h && m) return `${h}h ${m}m`;
      if (h) return `${h}h`;
      return `${m}m`;
    },
  },
};

export const dict: Record<Lang, Strings> = { uk, en };

export function langName(lang: Lang): string {
  return lang === "uk" ? "Ukrainian" : "English";
}
