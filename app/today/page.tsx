"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";

export default function TodayPage() {
  const { today, doneCount, loaded, toggleDone } = useTasks();

  const total = today.length;
  const allDone = total > 0 && doneCount === total;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <main className="screen">
      <h1 className="screen__title">Today</h1>
      <p className="screen__subtitle">Your checklist for today</p>

      {/* 3 стани: порожньо (онбординг) → в роботі (прогрес) → все виконано (перемога) */}
      {loaded && total === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            👋
          </span>
          <span className="empty__title">Let&apos;s plan your day</span>
          <span className="empty__text">
            Nothing scheduled yet. Dump what&apos;s on your mind and your tasks for
            today will show up here as a checklist.
          </span>
          <Link href="/capture" className="cta">
            ✍️ Start capturing
          </Link>
        </div>
      ) : (
        <>
          {total > 0 && (
            <div className="progress">
              <div className="progress__bar">
                <div
                  className="progress__fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="progress__label">
                {doneCount} / {total} done
              </span>
            </div>
          )}

          {allDone && (
            <div className="celebrate" role="status">
              <span className="celebrate__icon" aria-hidden>
                🎉
              </span>
              <span className="celebrate__title">
                You hit all your tasks for today!
              </span>
              <span className="celebrate__text">
                {total} {total === 1 ? "task" : "tasks"} done today. Nice work.
              </span>
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
                    aria-label={done ? "Mark as not done" : "Mark as done"}
                  >
                    {done ? "✓" : ""}
                  </button>
                  <span
                    className={`task__title${done ? " task__title--done" : ""}`}
                  >
                    {task.title}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
