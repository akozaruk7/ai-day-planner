import type { Category, Priority } from "./types";

export type Lang = "uk" | "en";

// Приблизний кличний відмінок для українських імен (для привітання).
// Латинські імена й невідомі закінчення лишаємо без змін.
function vocativeUk(name: string): string {
  const n = name.trim();
  if (!n) return n;
  if (/ія$/.test(n)) return n.slice(0, -1) + "є"; // Анастасія → Анастасіє
  if (/я$/.test(n)) return n.slice(0, -1) + "ю"; // Настя → Настю
  if (/а$/.test(n)) return n.slice(0, -1) + "о"; // Оксана → Оксано
  if (/[йь]$/.test(n)) return n.slice(0, -1) + "ю"; // Андрій → Андрію
  if (/[бвгґджзклмнпрстфхцчшщ]$/i.test(n)) return n + "е"; // Іван → Іване
  return n;
}

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
    dupTitle: string;
    dupText: string;
    dupAdd: string;
    dupSkip: string;
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
    viewAll: string;
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
    scheduleLabel: string;
    dayStart: string;
    dayEnd: string;
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
    dueEdit: string;
    editPrioHint: string;
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
  tab: { capture: "Запланувати", inbox: "Усі задачі", today: "Сьогодні" },
  capture: {
    placeholder: "Купити молока, подзвонити мамі, доробити презентацію…",
    sort: "✨ Перетворити на задачі",
    sorting: "Розбираю на задачі…",
    hintEmpty: "Перелічи всі задачі, що крутяться в голові",
    hintFilled: "AI розкладе це на задачі з пріоритетом і дедлайнами",
    error: "Не вдалося звʼязатися з AI. Перевір інтернет і спробуй ще раз.",
    retry: "Повторити",
    mic: "🎤 Диктувати",
    listening: "● Слухаю… (натисни, щоб зупинити)",
    dupTitle: "Такі задачі вже є",
    dupText: "Додати їх ще раз?",
    dupAdd: "Додати все одно",
    dupSkip: "Пропустити",
  },
  inbox: {
    title: "Усі задачі",
    subtitle: "Розпарсені задачі, які ще не заплановані",
    emptyTitle: "Поки порожньо",
    emptyText:
      "Запиши усі задачі на головному екрані, і Ладо збере всі задачі сюди.",
    cta: "✍️ Записати прямо зараз",
    add: "+ Сьогодні",
    badge: "✨ Раджу на сьогодні",
    all: "Всі",
  },
  today: {
    title: "Заплановані задачі на сьогодні",
    subtitle: "Чекліст задач на сьогодні",
    emptyTitle: "Сплануймо твій день",
    emptyText: "Поки що нічого не заплановано.",
    cta: "+ Додати задачі",
    viewAll: "Переглянути Усі задачі",
    celebrateTitle: "Всі задачі на сьогодні завершено!",
    emptyInboxTitle: "Нічого на сьогодні",
    emptyInboxText: (n) =>
      `В Усіх задачах ${n} задач, але жодну ще не позначено «на сьогодні». AI не вигадує дедлайнів, тож обери сам(а), що робитимеш сьогодні.`,
    emptyInboxCta: "📥 Відкрити Усі задачі",
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
    scheduleLabel: "Коли ти плануєш виконувати задачі?",
    dayStart: "Початок дня",
    dayEnd: "Кінець дня",
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
    const voc = vocativeUk(name);
    return voc ? `${part}, ${voc} 👋` : `${part} 👋`;
  },
  prio: { low: "При нагоді", medium: "Важливо", high: "Палає 🔥" },
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
    dueEdit: "Змінити дедлайн",
    editPrioHint: "Натисни, щоб змінити пріоритет",
  },
  progress: (done, total) => `${done} / ${total} виконано`,
  celebrateText: () => "Молодець, так тримати!",
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
    unfinishedQ: (n) => {
      const m10 = n % 10;
      const m100 = n % 100;
      const one = m10 === 1 && m100 !== 11;
      const few = m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14);
      const word = one
        ? "незавершена задача"
        : few
          ? "незавершені задачі"
          : "незавершених задач";
      return `${n} ${word} — що з ${one ? "нею" : "ними"}?`;
    },
    carry: "Перенести на завтра",
    toInbox: "Повернути в Усі задачі",
    allDone: "Усе виконано! 🎉",
    cancel: "Скасувати",
    toastCarry: (n) => `✓ День завершено. Перенесено на завтра: ${n}.`,
    toastInbox: (n) => `✓ День завершено. Повернуто в Усі задачі: ${n}.`,
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
    subtitle: "Обери, що робитимеш сьогодні — решта лишиться в Усіх задачах.",
    add: "+ Сьогодні",
    done: "Готово",
  },
};

const en: Strings = {
  tab: { capture: "Plan", inbox: "All tasks", today: "Today" },
  capture: {
    placeholder: "Buy milk, call mom, finish the deck…",
    sort: "✨ Turn into tasks",
    sorting: "Sorting into tasks…",
    hintEmpty: "List all the tasks buzzing in your head",
    hintFilled: "AI will split this into tasks with priority & deadlines",
    error: "Couldn't reach the AI. Check your connection and try again.",
    retry: "Retry",
    mic: "🎤 Dictate",
    listening: "● Listening… (tap to stop)",
    dupTitle: "These already exist",
    dupText: "Add them again?",
    dupAdd: "Add anyway",
    dupSkip: "Skip",
  },
  inbox: {
    title: "All tasks",
    subtitle: "Parsed tasks that aren't scheduled yet",
    emptyTitle: "Nothing here yet",
    emptyText:
      "Jot down all your tasks on the main screen, and Lado will gather them here.",
    cta: "✍️ Write them down now",
    add: "+ Today",
    badge: "✨ Suggested for today",
    all: "All",
  },
  today: {
    title: "Planned for today",
    subtitle: "Your checklist for today",
    emptyTitle: "Let's plan your day",
    emptyText: "Nothing planned yet.",
    cta: "+ Add tasks",
    viewAll: "View All tasks",
    celebrateTitle: "All today's tasks are done!",
    emptyInboxTitle: "Nothing for today",
    emptyInboxText: (n) =>
      `${n} in All tasks, but none is marked "for today" yet. The AI doesn't invent deadlines, so pick what you'll do today.`,
    emptyInboxCta: "📥 Open All tasks",
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
    scheduleLabel: "When do you plan to do tasks?",
    dayStart: "Day starts",
    dayEnd: "Day ends",
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
    dueEdit: "Change deadline",
    editPrioHint: "Tap to change priority",
  },
  progress: (done, total) => `${done} / ${total} done`,
  celebrateText: () => "Well done — keep it up!",
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
    unfinishedQ: (n) => `${n} unfinished ${n === 1 ? "task" : "tasks"} — what now?`,
    carry: "Carry to tomorrow",
    toInbox: "Move to All tasks",
    allDone: "All done! 🎉",
    cancel: "Cancel",
    toastCarry: (n) => `✓ Day ended. Carried to tomorrow: ${n}.`,
    toastInbox: (n) => `✓ Day ended. Moved to All tasks: ${n}.`,
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
    subtitle: "Pick what you'll do today — the rest stays in All tasks.",
    add: "+ Today",
    done: "Done",
  },
};

export const dict: Record<Lang, Strings> = { uk, en };

export function langName(lang: Lang): string {
  return lang === "uk" ? "Ukrainian" : "English";
}
