"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "./types";
import type { Category, DayRecord, ParsedTask, Task } from "./types";

const HISTORY_KEY = "ai-planner:history";

function normCategory(c: unknown): Category {
  return CATEGORIES.includes(c as Category) ? (c as Category) : "other";
}

const TASKS_KEY = "ai-planner:tasks";

function todayISO(): string {
  // Локальна дата у форматі YYYY-MM-DD (для порівняння з дедлайнами).
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Валідна ISO-дата YYYY-MM-DD (модель інколи повертає "" замість null).
function isISODate(d: unknown): d is string {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

// Нормалізуємо дедлайн: усе, що не справжня дата (""/сміття) → null.
function normalizeDeadline(d: unknown): string | null {
  return isISODate(d) ? d : null;
}

// Правило (не AI): що одразу потрапляє в Today.
function statusFor(deadline: string | null, isToday: boolean): Task["status"] {
  const isDueToday = deadline !== null && deadline <= todayISO();
  return isToday || isDueToday ? "today" : "inbox";
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

/**
 * Клієнтський стан задач із persist у localStorage.
 * Єдине джерело правди — бекенду немає.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        // Міграція: старі задачі без category отримують "other".
        setTasks(parsed.map((t) => ({ ...t, category: normCategory(t.category) })));
      }
    } catch {
      // пошкоджені дані — стартуємо з порожнього списку
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // квота/приватний режим — тихо ігноруємо
    }
  }, [tasks, loaded]);

  // Додати розпарсені AI-задачі (застосовуємо правило статусу тут, у коді).
  const addParsed = useCallback((parsed: ParsedTask[]) => {
    const now = Date.now();
    const mapped: Task[] = parsed.map((p, i) => {
      const deadline = normalizeDeadline(p.deadline);
      const status = statusFor(deadline, p.isToday === true);
      return {
        id: newId(),
        title: p.title,
        priority: p.priority,
        category: normCategory(p.category),
        estimateMin: typeof p.estimateMin === "number" ? p.estimateMin : null,
        deadline,
        status,
        // suggested має сенс лише для тих, що лишились у Inbox
        suggested: status === "inbox" && p.suggested,
        createdAt: now + i,
      };
    });
    setTasks((prev) => [...mapped, ...prev]);
  }, []);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "today" : "done" }
          : t
      )
    );
  }, []);

  // Перенести будь-яку задачу в Today одним тапом (і зняти бейдж suggested).
  const moveToToday = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "today", suggested: false } : t
      )
    );
  }, []);

  // Відкласти: повернути задачу з Today назад у Inbox.
  const moveToInbox = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "inbox" } : t
      )
    );
  }, []);

  // Тап по естімейту циклює кошики: null → 5 → 15 → 30 → 60 → 120 → null.
  const cycleEstimate = useCallback((id: string) => {
    const buckets: (number | null)[] = [null, 5, 15, 30, 60, 120];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const i = buckets.indexOf(t.estimateMin);
        const next = buckets[(i + 1) % buckets.length];
        return { ...t, estimateMin: next };
      })
    );
  }, []);

  // Завершити день: зберегти підсумок в історію, прибрати виконані,
  // а незавершені — перенести на завтра (лишити в Today) або в Inbox.
  const endDay = useCallback(
    (carryOver: boolean) => {
      const todays = tasks.filter(
        (t) => t.status === "today" || t.status === "done"
      );
      if (todays.length === 0) return;

      const record: DayRecord = {
        id: newId(),
        endedAt: Date.now(),
        date: todayISO(),
        done: todays.filter((t) => t.status === "done").length,
        total: todays.length,
        items: todays.map((t) => ({
          title: t.title,
          done: t.status === "done",
          category: t.category,
          priority: t.priority,
        })),
      };

      // Дописуємо в історію (side effect поза setTasks — щоб StrictMode не задублював).
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const hist: DayRecord[] = raw ? JSON.parse(raw) : [];
        hist.push(record);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
      } catch {
        // ignore
      }

      setTasks((prev) =>
        prev
          .filter((t) => t.status !== "done") // виконані → лише в історії
          .map((t) =>
            t.status === "today"
              ? { ...t, status: carryOver ? "today" : "inbox" }
              : t
          )
      );
    },
    [tasks]
  );

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const todayList = tasks.filter(
    (t) => t.status === "today" || t.status === "done"
  );

  return {
    tasks,
    loaded,
    inbox: tasks.filter((t) => t.status === "inbox"),
    today: todayList,
    doneCount: todayList.filter((t) => t.status === "done").length,
    addParsed,
    toggleDone,
    moveToToday,
    moveToInbox,
    cycleEstimate,
    endDay,
    removeTask,
  };
}

/** Читання історії завершених днів (для екрана /history). */
export function useHistory() {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setRecords(JSON.parse(raw) as DayRecord[]);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Найновіші зверху.
  const sorted = [...records].sort((a, b) => b.endedAt - a.endedAt);
  return { records: sorted, loaded };
}

const BUDGET_KEY = "ai-planner:day-budget";
const DEFAULT_BUDGET_MIN = 960; // 16 год = доба − 8 год сну (планер усього дня)
const BUDGET_STEP = 60; // крок 1 год
const BUDGET_MIN = 240; // 4 год
const BUDGET_MAX = 1200; // 20 год

/** Налаштовуваний бюджет часу на день (хвилини), persist у localStorage. */
export function useDayBudget() {
  const [availableMin, setAvailableMin] = useState(DEFAULT_BUDGET_MIN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BUDGET_KEY);
      const n = raw ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(n)) setAvailableMin(n);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((min: number) => {
    const clamped = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, min));
    setAvailableMin(clamped);
    try {
      localStorage.setItem(BUDGET_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  return {
    availableMin,
    loaded,
    increase: () => persist(availableMin + BUDGET_STEP),
    decrease: () => persist(availableMin - BUDGET_STEP),
  };
}

const DRAFT_KEY = "ai-planner:capture-draft";

/** Persist чернетки поля «What's on your mind?» між перезаходами. */
export function useCaptureDraft() {
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setDraft(localStorage.getItem(DRAFT_KEY) ?? "");
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, draft);
    } catch {
      // ignore
    }
  }, [draft, loaded]);

  return { draft, setDraft, loaded };
}
