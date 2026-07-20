"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";

export default function TodayPage() {
  const { today, loaded, toggleDone } = useTasks();

  return (
    <main className="screen">
      <h1 className="screen__title">Today</h1>
      <p className="screen__subtitle">Your checklist for today</p>

      {loaded && today.length === 0 ? (
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
      )}
    </main>
  );
}
