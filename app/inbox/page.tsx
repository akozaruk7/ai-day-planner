"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import type { Task } from "@/lib/types";
import type { Strings } from "@/lib/i18n";

function meta(task: Task, t: Strings): string {
  const parts: string[] = [];
  if (task.estimateMin != null) parts.push(t.meta.min(task.estimateMin));
  if (task.deadline) parts.push(t.meta.due(task.deadline));
  return parts.join(" · ");
}

export default function InboxPage() {
  const { inbox, loaded, moveToToday, toggleDone } = useTasks();
  const { t } = useLang();

  return (
    <main className="screen">
      <h1 className="screen__title">{t.inbox.title}</h1>
      <p className="screen__subtitle">{t.inbox.subtitle}</p>

      {loaded && inbox.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            📥
          </span>
          <span className="empty__title">{t.inbox.emptyTitle}</span>
          <span className="empty__text">{t.inbox.emptyText}</span>
          <Link href="/capture" className="cta">
            {t.inbox.cta}
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
                aria-label="Done"
              />
              <div className="task__body">
                <span className="task__title">{task.title}</span>
                <span className="task__meta">
                  <span className={`prio prio--${task.priority}`}>
                    {t.prio[task.priority]}
                  </span>
                  {meta(task, t) && <span>{meta(task, t)}</span>}
                  {task.suggested && <span className="badge">{t.inbox.badge}</span>}
                </span>
              </div>
              <button
                type="button"
                className="task__add"
                onClick={() => moveToToday(task.id)}
                aria-label={t.inbox.add}
              >
                {t.inbox.add}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
