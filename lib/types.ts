export type Priority = "low" | "medium" | "high";
export type TaskStatus = "inbox" | "today" | "done";

export interface Task {
  id: string;
  title: string;
  priority: Priority; // ← AI
  estimateMin: number | null; // ← AI: орієнтовні хвилини
  deadline: string | null; // ← AI: ISO-дата (YYYY-MM-DD) або null
  status: TaskStatus; // ← правило (не AI)
  suggested: boolean; // ← AI: рекомендація на сьогодні
  createdAt: number;
}

/** Форма однієї задачі, яку повертає AI (без id/status/createdAt — їх додає клієнт). */
export interface ParsedTask {
  title: string;
  priority: Priority;
  estimateMin: number | null;
  deadline: string | null;
  isToday: boolean; // явне «сьогодні/терміново»
  suggested: boolean; // рекомендована на сьогодні (топ-3 з беклогу)
}
