"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "./types";
import type { Category, DayRecord, ParsedTask, Task } from "./types";

const HISTORY_KEY = "ai-planner:history";

function normCategory(c: unknown): Category {
  return CATEGORIES.includes(c as Category) ? (c as Category) : "other";
}

const TASKS_KEY = "ai-planner:tasks";

function isoOf(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayISO(): string {
  return isoOf(new Date());
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoOf(d);
}

// Чи задача належить «сьогодні» (з урахуванням авто-перекочування прострочених).
function isOnToday(t: Task, day: string): boolean {
  if (t.status !== "today" && t.status !== "done") return false;
  return t.scheduledFor == null || t.scheduledFor <= day;
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
        // Міграція: старі задачі без category/scheduledFor.
        const today = todayISO();
        setTasks(
          parsed.map((t) => ({
            ...t,
            category: normCategory(t.category),
            scheduledFor:
              t.scheduledFor ?? (t.status === "inbox" ? null : today),
          }))
        );
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
        scheduledFor: status === "today" ? todayISO() : null,
        // suggested має сенс лише для тих, що лишились у Inbox
        suggested: status === "inbox" && p.suggested,
        createdAt: now + i,
      };
    });
    setTasks((prev) => [...mapped, ...prev]);
    // Повертаємо id тих, що лишились у Вхідних — для екрана тріажу.
    return mapped.filter((t) => t.status === "inbox").map((t) => t.id);
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
        t.id === id
          ? { ...t, status: "today", scheduledFor: todayISO(), suggested: false }
          : t
      )
    );
  }, []);

  // Відкласти: повернути задачу з Today назад у Inbox.
  const moveToInbox = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "inbox", scheduledFor: null } : t
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
      const day = todayISO();
      const todays = tasks.filter((t) => isOnToday(t, day));
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
          // виконані сьогоднішні → лише в історії
          .filter((t) => !(t.status === "done" && isOnToday(t, day)))
          .map((t) => {
            if (t.status === "today" && isOnToday(t, day)) {
              // незавершені: на завтра (нова дата) або назад у Inbox
              return carryOver
                ? { ...t, scheduledFor: tomorrowISO() }
                : { ...t, status: "inbox", scheduledFor: null };
            }
            return t;
          })
      );
    },
    [tasks]
  );

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const day = todayISO();
  const todayList = tasks.filter((t) => isOnToday(t, day));
  const tomorrowList = tasks.filter(
    (t) => t.status === "today" && t.scheduledFor != null && t.scheduledFor > day
  );

  return {
    tasks,
    loaded,
    inbox: tasks.filter((t) => t.status === "inbox"),
    today: todayList,
    tomorrow: tomorrowList,
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

const BEDTIME_KEY = "ai-planner:bedtime-min";
const DEFAULT_BEDTIME_MIN = 23 * 60; // 23:00
const BEDTIME_STEP = 30;
const BEDTIME_MIN = 18 * 60; // 18:00
const BEDTIME_MAX = 24 * 60 - 1; // 23:59

/**
 * Час відходу до сну (хвилини від початку доби), persist у localStorage.
 * Доступний час на день рахується як «від зараз до сну» (див. Today).
 */
export function useDayBudget() {
  const [bedtimeMin, setBedtime] = useState(DEFAULT_BEDTIME_MIN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEDTIME_KEY);
      const n = raw ? parseInt(raw, 10) : NaN;
      if (Number.isFinite(n)) setBedtime(n);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((min: number) => {
    const clamped = Math.min(BEDTIME_MAX, Math.max(BEDTIME_MIN, min));
    setBedtime(clamped);
    try {
      localStorage.setItem(BEDTIME_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  return {
    bedtimeMin,
    loaded,
    increase: () => persist(bedtimeMin + BEDTIME_STEP),
    decrease: () => persist(bedtimeMin - BEDTIME_STEP),
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
