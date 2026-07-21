export type Priority = "low" | "medium" | "high";
export type TaskStatus = "inbox" | "today" | "done";
export type Category =
  | "work"
  | "sport"
  | "leisure"
  | "family"
  | "chores"
  | "other";

export const CATEGORIES: Category[] = [
  "work",
  "sport",
  "leisure",
  "family",
  "chores",
  "other",
];

export interface Task {
  id: string;
  title: string;
  priority: Priority; // ← AI
  category: Category; // ← AI: рід діяльності (навантаження/баланс дня)
  estimateMin: number | null; // ← AI: орієнтовні хвилини
  deadline: string | null; // ← AI: ISO-дата (YYYY-MM-DD) або null
  status: TaskStatus; // ← правило (не AI)
  suggested: boolean; // ← AI: рекомендація на сьогодні
  createdAt: number;
}

/** Запис одного завершеного дня для історії. */
export interface DayRecord {
  id: string;
  endedAt: number; // timestamp завершення
  date: string; // YYYY-MM-DD (локальна дата)
  done: number;
  total: number;
  items: {
    title: string;
    done: boolean;
    category: Category;
    priority: Priority;
  }[];
}

/** Форма однієї задачі, яку повертає AI (без id/status/createdAt — їх додає клієнт). */
export interface ParsedTask {
  title: string;
  priority: Priority;
  category: Category;
  estimateMin: number | null;
  deadline: string | null;
  isToday: boolean; // явне «сьогодні/терміново»
  suggested: boolean; // рекомендована на сьогодні (топ-3 з беклогу)
}
