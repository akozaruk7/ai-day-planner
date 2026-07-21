"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import Mascot from "@/components/Mascot";

const BATCH_KEY = "ai-planner:triage-batch";

export default function TriagePage() {
  const { inbox, loaded, moveToToday, cycleEstimate } = useTasks();
  const { t } = useLang();
  const router = useRouter();

  const [batchIds, setBatchIds] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BATCH_KEY);
      setBatchIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setBatchIds([]);
    }
  }, []);

  function finish() {
    try {
      localStorage.removeItem(BATCH_KEY);
    } catch {
      // ignore
    }
    router.replace("/today");
  }

  // Задачі партії, що ще у Вхідних (suggested — зверху).
  const items =
    batchIds === null ? [] : inbox.filter((tk) => batchIds.includes(tk.id));
  const sorted = [...items].sort(
    (a, b) => Number(b.suggested) - Number(a.suggested)
  );

  // Коли все розсортовано (або нема що) — на Today.
  const empty = batchIds !== null && loaded && items.length === 0;
  useEffect(() => {
    if (empty) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empty]);

  return (
    <main className="screen">
      <div className="triage__hero">
        <Mascot state="thinking" size={72} />
        <div>
          <h1 className="screen__title">{t.triage.title}</h1>
          <p className="screen__subtitle">{t.triage.subtitle}</p>
        </div>
      </div>

      <ul className="task-list">
        {sorted.map((task) => (
          <li
            key={task.id}
            className={`task task--${task.priority}${task.suggested ? " task--suggested" : ""}`}
          >
            <div className="task__body">
              <span className="task__title">{task.title}</span>
              <span className="task__meta">
                <span className={`cat cat--${task.category}`}>
                  {t.cat[task.category]}
                </span>
                <span className={`prio prio--${task.priority}`}>
                  {t.prio[task.priority]}
                </span>
                <button
                  type="button"
                  className="chip-edit"
                  onClick={() => cycleEstimate(task.id)}
                  aria-label={t.meta.editTimeHint}
                  title={t.meta.editTimeHint}
                >
                  {task.estimateMin != null
                    ? t.meta.min(task.estimateMin)
                    : t.meta.setTime}
                </button>
                {task.deadline && <span>{t.meta.due(task.deadline)}</span>}
                {task.suggested && (
                  <span className="badge">{t.inbox.badge}</span>
                )}
              </span>
            </div>
            <button
              type="button"
              className="task__add"
              onClick={() => moveToToday(task.id)}
              aria-label={t.triage.add}
            >
              {t.triage.add}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="end-day-btn" onClick={finish}>
        {t.triage.done}
      </button>
    </main>
  );
}
