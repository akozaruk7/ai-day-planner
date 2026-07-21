"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParsedTask, Task } from "./types";

const TASKS_KEY = "ai-planner:tasks";

function todayISO(): string {
  // Локальна дата у форматі YYYY-MM-DD (для порівняння з дедлайнами).
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Правило (не AI): що одразу потрапляє в Today.
function statusFor(t: ParsedTask): Task["status"] {
  const isDueToday = t.deadline !== null && t.deadline <= todayISO();
  return t.isToday || isDueToday ? "today" : "inbox";
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
      if (raw) setTasks(JSON.parse(raw) as Task[]);
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
      const status = statusFor(p);
      return {
        id: newId(),
        title: p.title,
        priority: p.priority,
        estimateMin: p.estimateMin,
        deadline: p.deadline,
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
    removeTask,
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
