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
    mic: string;
    listening: string;
  };
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
  today: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyText: string;
    cta: string;
    celebrateTitle: string;
    emptyInboxTitle: string;
    emptyInboxText: (n: number) => string;
    emptyInboxCta: string;
    tomorrow: string;
    endedTitle: string;
    endedText: (n: number) => string;
  };
  welcome: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    bedtimeLabel: string;
    earlier: string;
    later: string;
    start: string;
    skip: string;
  };
  greeting: (name: string, hour: number) => string;
  prio: Record<Priority, string>;
  cat: Record<Category, string>;
  meta: {
    min: (n: number) => string;
    due: (d: string) => string;
    setTime: string;
    editTimeHint: string;
  };
  progress: (done: number, total: number) => string;
  celebrateText: (n: number) => string;
  capacity: {
    label: string;
    over: string;
    noEstimate: (n: number) => string;
    fmt: (min: number) => string;
  };
  endDay: {
    button: string;
    title: string;
    done: (d: number, total: number) => string;
    unfinishedQ: (n: number) => string;
    carry: string;
    toInbox: string;
    allDone: string;
    cancel: string;
    toastCarry: (n: number) => string;
    toastInbox: (n: number) => string;
    toastAllDone: string;
  };
  history: {
    title: string;
    link: string;
    empty: string;
    emptyText: string;
  };
  triage: {
    title: string;
    subtitle: string;
    add: string;
    done: string;
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
    mic: "🎤 Диктувати",
    listening: "● Слухаю… (натисни, щоб зупинити)",
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
    all: "Всі",
  },
  today: {
    title: "Сьогодні",
    subtitle: "Чекліст задач на сьогодні",
    emptyTitle: "Сплануймо твій день",
    emptyText:
      "Поки нічого не заплановано. Вивали, що в голові — задачі на сьогодні зʼявляться тут чеклістом.",
    cta: "✍️ Почати захоплювати",
    celebrateTitle: "Ти закрив усі задачі на сьогодні!",
    emptyInboxTitle: "Нічого на сьогодні",
    emptyInboxText: (n) =>
      `У Вхідних ${n} — жодну не позначено «на сьогодні». AI не вигадує дедлайнів, тож обери сам(а), що робитимеш сьогодні.`,
    emptyInboxCta: "📥 Відкрити Вхідні",
    tomorrow: "🌙 Завтра",
    endedTitle: "День завершено",
    endedText: (n) =>
      `${n} ${n === 1 ? "задача чекає" : "задач чекають"} на завтра.`,
  },
  welcome: {
    title: "Привіт! Я Ладо",
    subtitle: "Допоможу спланувати твій день. Познайомимось?",
    nameLabel: "Як тебе звати?",
    namePlaceholder: "Твоє імʼя",
    bedtimeLabel: "О котрій зазвичай лягаєш спати?",
    earlier: "Раніше",
    later: "Пізніше",
    start: "Поїхали",
    skip: "Пропустити",
  },
  greeting: (name, hour) => {
    const part =
      hour >= 5 && hour < 12
        ? "Доброго ранку"
        : hour >= 12 && hour < 18
          ? "Доброго дня"
          : hour >= 18 && hour < 23
            ? "Доброго вечора"
            : "Доброї ночі";
    return name ? `${part}, ${name} 👋` : `${part} 👋`;
  },
  prio: { low: "на десерт", medium: "важливо", high: "критично" },
  cat: {
    work: "робота",
    sport: "спорт",
    leisure: "дозвілля",
    family: "сімʼя",
    chores: "побут",
    other: "інше",
  },
  meta: {
    min: (n) => `${n} хв`,
    due: (d) => `до ${d}`,
    setTime: "⏱ час?",
    editTimeHint: "Натисни, щоб змінити час",
  },
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
  endDay: {
    button: "Завершити день",
    title: "Підсумок дня",
    done: (d, total) => `Виконано ${d} з ${total}`,
    unfinishedQ: (n) => `${n} незавершених — що з ними?`,
    carry: "Перенести на завтра",
    toInbox: "Повернути в Inbox",
    allDone: "Усе виконано! 🎉",
    cancel: "Скасувати",
    toastCarry: (n) => `✓ День завершено. Перенесено на завтра: ${n}.`,
    toastInbox: (n) => `✓ День завершено. Повернуто в Inbox: ${n}.`,
    toastAllDone: "✓ День завершено. Усе виконано! 🎉",
  },
  history: {
    title: "Історія",
    link: "🗓 Історія",
    empty: "Історія порожня",
    emptyText: "Заверши день на «Сьогодні» — тут зʼявлятимуться підсумки.",
  },
  triage: {
    title: "Що на сьогодні?",
    subtitle: "Обери, що робитимеш сьогодні — решта лишиться у Вхідних.",
    add: "+ Сьогодні",
    done: "Готово",
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
    mic: "🎤 Dictate",
    listening: "● Listening… (tap to stop)",
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
    all: "All",
  },
  today: {
    title: "Today",
    subtitle: "Your checklist for today",
    emptyTitle: "Let's plan your day",
    emptyText:
      "Nothing scheduled yet. Dump what's on your mind and your tasks for today will show up here as a checklist.",
    cta: "✍️ Start capturing",
    celebrateTitle: "You hit all your tasks for today!",
    emptyInboxTitle: "Nothing for today",
    emptyInboxText: (n) =>
      `${n} in Inbox — none marked "for today". The AI doesn't invent deadlines, so pick what you'll do today.`,
    emptyInboxCta: "📥 Open Inbox",
    tomorrow: "🌙 Tomorrow",
    endedTitle: "Day ended",
    endedText: (n) =>
      `${n} ${n === 1 ? "task is waiting" : "tasks are waiting"} for tomorrow.`,
  },
  welcome: {
    title: "Hi! I'm Lado",
    subtitle: "I'll help you plan your day. Shall we get to know each other?",
    nameLabel: "What's your name?",
    namePlaceholder: "Your name",
    bedtimeLabel: "When do you usually go to bed?",
    earlier: "Earlier",
    later: "Later",
    start: "Let's go",
    skip: "Skip",
  },
  greeting: (name, hour) => {
    const part =
      hour >= 5 && hour < 12
        ? "Good morning"
        : hour >= 12 && hour < 18
          ? "Good afternoon"
          : hour >= 18 && hour < 23
            ? "Good evening"
            : "Good night";
    return name ? `${part}, ${name} 👋` : `${part} 👋`;
  },
  prio: { low: "nice-to-do", medium: "important", high: "critical" },
  cat: {
    work: "work",
    sport: "sport",
    leisure: "leisure",
    family: "family",
    chores: "chores",
    other: "other",
  },
  meta: {
    min: (n) => `${n} min`,
    due: (d) => `due ${d}`,
    setTime: "⏱ time?",
    editTimeHint: "Tap to change time",
  },
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
  endDay: {
    button: "End the day",
    title: "Day summary",
    done: (d, total) => `${d} of ${total} done`,
    unfinishedQ: (n) => `${n} unfinished — what now?`,
    carry: "Carry to tomorrow",
    toInbox: "Move to Inbox",
    allDone: "All done! 🎉",
    cancel: "Cancel",
    toastCarry: (n) => `✓ Day ended. Carried to tomorrow: ${n}.`,
    toastInbox: (n) => `✓ Day ended. Moved to Inbox: ${n}.`,
    toastAllDone: "✓ Day ended. All done! 🎉",
  },
  history: {
    title: "History",
    link: "🗓 History",
    empty: "No history yet",
    emptyText: "End a day on Today — summaries will show up here.",
  },
  triage: {
    title: "What's for today?",
    subtitle: "Pick what you'll do today — the rest stays in Inbox.",
    add: "+ Today",
    done: "Done",
  },
};

export const dict: Record<Lang, Strings> = { uk, en };

export function langName(lang: Lang): string {
  return lang === "uk" ? "Ukrainian" : "English";
}
