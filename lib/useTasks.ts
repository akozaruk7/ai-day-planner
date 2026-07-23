"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "./types";
import type { Category, DayRecord, ParsedTask, Priority, Task } from "./types";

const HISTORY_KEY = "ai-planner:history";

function normCategory(c: unknown): Category {
  return CATEGORIES.includes(c as Category) ? (c as Category) : "other";
}

const TASKS_KEY = "ai-planner:tasks";
const PLAN_START_KEY = "ai-planner:plan-start-min";
const PLAN_END_KEY = "ai-planner:plan-end-min";
const DEFAULT_START_MIN = 9 * 60; // 09:00
const DEFAULT_END_MIN = 22 * 60; // 22:00
const LAST_PLANNED_KEY = "ai-planner:last-planned-day";
const APPROACH_DAYS = 2; // дедлайн у межах N днів вважаємо «наближається»
const DEFAULT_TASK_MIN = 30; // хвилин для задач без оцінки (наповнення дня)

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

// ISO-дата через N днів від сьогодні.
function isoPlusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return isoOf(d);
}

// Тривалість вікна планування (хв) з localStorage; дефолт — 09:00–22:00.
function readWindowMin(): number {
  try {
    const s = parseInt(localStorage.getItem(PLAN_START_KEY) ?? "", 10);
    const e = parseInt(localStorage.getItem(PLAN_END_KEY) ?? "", 10);
    if (Number.isFinite(s) && Number.isFinite(e)) return Math.max(0, e - s);
  } catch {
    // ignore
  }
  return DEFAULT_END_MIN - DEFAULT_START_MIN;
}

// Авто-наповнення «Сьогодні» з беклогу: спершу задачі з дедлайном, що
// наближається, потім — за пріоритетом, поки не заповниться вікно дня.
function autoPlanFromBacklog(
  tasks: Task[],
  windowMin: number,
  today: string,
  approachIso: string
): Task[] {
  const onToday = (t: Task) =>
    (t.status === "today" || t.status === "done") &&
    (t.scheduledFor == null || t.scheduledFor <= today);
  let usedMin = tasks
    .filter(onToday)
    .reduce((sum, t) => sum + (t.estimateMin ?? DEFAULT_TASK_MIN), 0);

  const prioWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
  const isApproaching = (t: Task) =>
    t.deadline != null && t.deadline <= approachIso;

  const backlog = tasks
    .filter((t) => t.status === "inbox")
    .sort((a, b) => {
      const ad = isApproaching(a) ? 1 : 0;
      const bd = isApproaching(b) ? 1 : 0;
      if (ad !== bd) return bd - ad; // дедлайн наближається — першими
      return prioWeight[b.priority] - prioWeight[a.priority];
    });

  const promote = new Set<string>();
  for (const t of backlog) {
    const cost = t.estimateMin ?? DEFAULT_TASK_MIN;
    if (isApproaching(t)) {
      promote.add(t.id); // дедлайн — беремо завжди
      usedMin += cost;
    } else if (usedMin + cost <= windowMin) {
      promote.add(t.id);
      usedMin += cost;
    }
  }

  if (promote.size === 0) return tasks;
  return tasks.map((t) =>
    promote.has(t.id) ? { ...t, status: "today", scheduledFor: today } : t
  );
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
// Рекомендовані (suggested) також ідуть у Today — авто-додавання.
function statusFor(
  deadline: string | null,
  isToday: boolean,
  suggested: boolean
): Task["status"] {
  const isDueToday = deadline !== null && deadline <= todayISO();
  return isToday || isDueToday || suggested ? "today" : "inbox";
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

// Нормалізована назва для дедупу (регістр/зайві пробіли не враховуємо).
function normTitle(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// Побудувати задачу з розпарсеного AI-елемента (правило статусу — у коді).
function buildTask(p: ParsedTask, createdAt: number): Task {
  const deadline = normalizeDeadline(p.deadline);
  const status = statusFor(deadline, p.isToday === true, p.suggested === true);
  return {
    id: newId(),
    title: p.title,
    priority: p.priority,
    category: normCategory(p.category),
    estimateMin: typeof p.estimateMin === "number" ? p.estimateMin : null,
    deadline,
    status,
    scheduledFor: status === "today" ? todayISO() : null,
    suggested: p.suggested === true,
    createdAt,
  };
}

// Обʼєднати два записи історії за одну дату в один (дедуп за назвою;
// «виконано», якщо виконано хоч в одному).
function mergeDayRecords(a: DayRecord, b: DayRecord): DayRecord {
  const byTitle = new Map<string, DayRecord["items"][number]>();
  for (const it of [...a.items, ...b.items]) {
    const key = normTitle(it.title);
    const prev = byTitle.get(key);
    byTitle.set(key, prev ? { ...prev, done: prev.done || it.done } : it);
  }
  const items = Array.from(byTitle.values());
  return {
    id: a.id,
    endedAt: Math.max(a.endedAt, b.endedAt),
    date: a.date,
    total: items.length,
    done: items.filter((it) => it.done).length,
    items,
  };
}

// Згорнути всю історію до одного запису на дату (для чищення старих дублів).
function mergeHistoryByDate(hist: DayRecord[]): DayRecord[] {
  const byDate = new Map<string, DayRecord>();
  for (const r of hist) {
    const prev = byDate.get(r.date);
    byDate.set(r.date, prev ? mergeDayRecords(prev, r) : r);
  }
  return Array.from(byDate.values());
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
      const today = todayISO();
      // Міграція: старі задачі без category/scheduledFor.
      let list: Task[] = raw
        ? (JSON.parse(raw) as Task[]).map((t) => ({
            ...t,
            category: normCategory(t.category),
            scheduledFor:
              t.scheduledFor ?? (t.status === "inbox" ? null : today),
          }))
        : [];

      // Авто-наповнення «Сьогодні» з беклогу — один раз на новий день.
      const lastPlanned = localStorage.getItem(LAST_PLANNED_KEY);
      if (lastPlanned !== today) {
        if (list.length > 0) {
          const planned = autoPlanFromBacklog(
            list,
            readWindowMin(),
            today,
            isoPlusDays(APPROACH_DAYS)
          );
          if (planned !== list) {
            list = planned;
            try {
              localStorage.setItem(TASKS_KEY, JSON.stringify(list));
            } catch {
              // ignore
            }
          }
        }
        try {
          localStorage.setItem(LAST_PLANNED_KEY, today);
        } catch {
          // ignore
        }
      }

      setTasks(list);
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

  // Додати розпарсені AI-задачі (усі, без дедупу — рішення про дублі в UI).
  const addParsed = useCallback((parsed: ParsedTask[]) => {
    if (parsed.length === 0) return;
    const now = Date.now();
    const mapped = parsed.map((p, i) => buildTask(p, now + i));
    setTasks((prev) => [...mapped, ...prev]);
  }, []);

  // Розділити розпарсені на нові та дублікати (активна задача з такою ж
  // назвою вже існує, або повтор у самому дампі) — щоб спитати користувача.
  const splitByExisting = useCallback(
    (parsed: ParsedTask[]) => {
      const active = new Set(
        tasks.filter((t) => t.status !== "done").map((t) => normTitle(t.title))
      );
      const seen = new Set<string>();
      const fresh: ParsedTask[] = [];
      const dups: ParsedTask[] = [];
      for (const p of parsed) {
        const key = normTitle(p.title);
        if (!key) continue;
        if (active.has(key) || seen.has(key)) dups.push(p);
        else {
          seen.add(key);
          fresh.push(p);
        }
      }
      return { fresh, dups };
    },
    [tasks]
  );

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

  // Ручне редагування дедлайну (ISO-дата або null, щоб прибрати).
  const setDeadline = useCallback((id: string, deadline: string | null) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deadline } : t))
    );
  }, []);

  // Тап по пріоритету циклює: При нагоді → Важливо → Палає → …
  const cyclePriority = useCallback((id: string) => {
    const order: Priority[] = ["low", "medium", "high"];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const i = order.indexOf(t.priority);
        return { ...t, priority: order[(i + 1) % order.length] };
      })
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
        const idx = hist.findIndex((r) => r.date === record.date);
        if (idx >= 0) hist[idx] = mergeDayRecords(hist[idx], record);
        else hist.push(record);
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
    splitByExisting,
    toggleDone,
    moveToToday,
    moveToInbox,
    cycleEstimate,
    setDeadline,
    cyclePriority,
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
      if (raw) {
        const parsed = JSON.parse(raw) as DayRecord[];
        const merged = mergeHistoryByDate(parsed);
        setRecords(merged);
        // Почистити старі дублі за датою у сховищі.
        if (merged.length !== parsed.length) {
          try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Найновіші зверху.
  const sorted = [...records].sort((a, b) => b.endedAt - a.endedAt);
  return { records: sorted, loaded };
}

const PLAN_STEP = 30;
const EARLIEST_START = 4 * 60; // 04:00
const LATEST_END = 24 * 60 - 1; // 23:59

/**
 * Графік планування дня — «з якої по яку годину» (хвилини від початку доби),
 * persist у localStorage. Доступний час = від max(зараз, старт) до кінця дня.
 */
export function useDayBudget() {
  const [planStartMin, setStartMin] = useState(DEFAULT_START_MIN);
  const [planEndMin, setEndMin] = useState(DEFAULT_END_MIN);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = parseInt(localStorage.getItem(PLAN_START_KEY) ?? "", 10);
      const e = parseInt(localStorage.getItem(PLAN_END_KEY) ?? "", 10);
      if (Number.isFinite(s)) setStartMin(s);
      if (Number.isFinite(e)) setEndMin(e);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveStart = useCallback((min: number, end: number) => {
    const clamped = Math.min(end - PLAN_STEP, Math.max(EARLIEST_START, min));
    setStartMin(clamped);
    try {
      localStorage.setItem(PLAN_START_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  const saveEnd = useCallback((min: number, start: number) => {
    const clamped = Math.min(LATEST_END, Math.max(start + PLAN_STEP, min));
    setEndMin(clamped);
    try {
      localStorage.setItem(PLAN_END_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  return {
    planStartMin,
    planEndMin,
    windowMin: Math.max(0, planEndMin - planStartMin),
    loaded,
    startEarlier: () => saveStart(planStartMin - PLAN_STEP, planEndMin),
    startLater: () => saveStart(planStartMin + PLAN_STEP, planEndMin),
    endEarlier: () => saveEnd(planEndMin - PLAN_STEP, planStartMin),
    endLater: () => saveEnd(planEndMin + PLAN_STEP, planStartMin),
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
