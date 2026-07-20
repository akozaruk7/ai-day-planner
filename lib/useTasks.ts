"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "./types";

const TASKS_KEY = "ai-planner:tasks";

/**
 * Клієнтський стан задач із persist у localStorage.
 * Бекенду немає — це єдине джерело правди для каркаса.
 * Поки що AI-парсингу немає, тому список задач стартує порожнім.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Гідратуємо стан з localStorage лише на клієнті.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch {
      // пошкоджені дані ігноруємо — стартуємо з порожнього списку
    }
    setLoaded(true);
  }, []);

  // Пишемо назад у localStorage після кожної зміни (тільки після гідратації).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // квота/приватний режим — тихо ігноруємо
    }
  }, [tasks, loaded]);

  const toggleDone = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "today" : "done" }
          : t
      )
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    tasks,
    loaded,
    inbox: tasks.filter((t) => t.status === "inbox"),
    today: tasks.filter((t) => t.status === "today" || t.status === "done"),
    toggleDone,
    removeTask,
  };
}

const DRAFT_KEY = "ai-planner:capture-draft";

/**
 * Persist чернетки поля «Що в голові?», щоб текст не губився між перезаходами.
 * Наочно демонструє зв'язку React state ↔ localStorage без бекенду.
 */
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
