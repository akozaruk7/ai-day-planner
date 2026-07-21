"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";

export default function InboxPage() {
  const { inbox, loaded, moveToToday, toggleDone, cycleEstimate } = useTasks();
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
              className={`task task--${task.priority}${task.suggested ? " task--suggested" : ""}`}
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
