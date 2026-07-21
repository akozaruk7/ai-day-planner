"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";

export default function TodayPage() {
  const { today, doneCount, loaded, toggleDone, moveToInbox } = useTasks();
  const { t } = useLang();

  const total = today.length;
  const allDone = total > 0 && doneCount === total;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <main className="screen">
      <h1 className="screen__title">{t.today.title}</h1>
      <p className="screen__subtitle">{t.today.subtitle}</p>

      {/* 3 стани: порожньо (онбординг) → в роботі (прогрес) → все виконано (перемога) */}
      {loaded && total === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            👋
          </span>
          <span className="empty__title">{t.today.emptyTitle}</span>
          <span className="empty__text">{t.today.emptyText}</span>
          <Link href="/capture" className="cta">
            {t.today.cta}
          </Link>
        </div>
      ) : (
        <>
          {total > 0 && (
            <div className="progress">
              <div className="progress__bar">
                <div className="progress__fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="progress__label">
                {t.progress(doneCount, total)}
              </span>
            </div>
          )}

          {allDone && (
            <div className="celebrate" role="status">
              <span className="celebrate__icon" aria-hidden>
                🎉
              </span>
              <span className="celebrate__title">{t.today.celebrateTitle}</span>
              <span className="celebrate__text">{t.celebrateText(total)}</span>
            </div>
          )}

          <ul className="task-list">
            {today.map((task) => {
              const done = task.status === "done";
              return (
                <li key={task.id} className="task">
                  <button
                    type="button"
                    className={`task__check${done ? " task__check--done" : ""}`}
                    onClick={() => toggleDone(task.id)}
                    aria-label="Toggle done"
                  >
                    {done ? "✓" : ""}
                  </button>
                  <span
                    className={`task__title${done ? " task__title--done" : ""}`}
                  >
                    {task.title}
                  </span>
                  {!done && (
                    <button
                      type="button"
                      className="task__defer"
                      onClick={() => moveToInbox(task.id)}
                      aria-label="Defer to Inbox"
                    >
                      ↩
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
