"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import type { Task } from "@/lib/types";

function meta(task: Task): string {
  const parts: string[] = [];
  if (task.estimateMin != null) parts.push(`${task.estimateMin} min`);
  if (task.deadline) parts.push(`due ${task.deadline}`);
  return parts.join(" · ");
}

export default function InboxPage() {
  const { inbox, loaded, acceptSuggestion, toggleDone } = useTasks();

  return (
    <main className="screen">
      <h1 className="screen__title">Inbox</h1>
      <p className="screen__subtitle">Parsed tasks that aren&apos;t scheduled yet</p>

      {loaded && inbox.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            📥
          </span>
          <span className="empty__title">Nothing here yet</span>
          <span className="empty__text">
            Dump your thoughts on the Capture screen — parsed tasks will land here.
          </span>
          <Link href="/capture" className="cta">
            ✍️ Capture something
          </Link>
        </div>
      ) : (
        <ul className="task-list">
          {inbox.map((task) => (
            <li
              key={task.id}
              className={`task${task.suggested ? " task--suggested" : ""}`}
            >
              <button
                type="button"
                className="task__check"
                onClick={() => toggleDone(task.id)}
                aria-label="Mark as done"
              />
              <div className="task__body">
                <span className="task__title">{task.title}</span>
                <span className="task__meta">
                  <span className={`prio prio--${task.priority}`}>
                    {task.priority}
                  </span>
                  {meta(task) && <span>{meta(task)}</span>}
                  {task.suggested && (
                    <span className="badge">✨ Suggested for today</span>
                  )}
                </span>
              </div>
              {task.suggested && (
                <button
                  type="button"
                  className="task__add"
                  onClick={() => acceptSuggestion(task.id)}
                  aria-label="Add to Today"
                >
                  + Today
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
