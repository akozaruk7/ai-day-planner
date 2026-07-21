"use client";

import Link from "next/link";
import { useTasks, useDayBudget } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import { CATEGORIES } from "@/lib/types";

export default function TodayPage() {
  const { today, doneCount, loaded, toggleDone, moveToInbox, cycleEstimate } =
    useTasks();
  const { availableMin, increase, decrease } = useDayBudget();
  const { t } = useLang();

  // Список від найпріоритетніших до менш пріоритетних (стабільне сортування).
  const prioWeight = { high: 3, medium: 2, low: 1 } as const;
  const sortedToday = [...today].sort(
    (a, b) => prioWeight[b.priority] - prioWeight[a.priority]
  );

  const total = today.length;
  const allDone = total > 0 && doneCount === total;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // Навантаження дня: сума оцінок задач Today проти бюджету часу.
  const plannedMin = today.reduce((sum, tk) => sum + (tk.estimateMin ?? 0), 0);
  const unestimated = today.filter((tk) => tk.estimateMin == null).length;
  const over = plannedMin > availableMin;
  const loadPct =
    availableMin > 0 ? Math.min(100, Math.round((plannedMin / availableMin) * 100)) : 0;

  // Розбивка дня по категоріях (лише присутні, у сталому порядку).
  const byCat: Record<string, number> = {};
  today.forEach((tk) => {
    byCat[tk.category] = (byCat[tk.category] ?? 0) + (tk.estimateMin ?? 0);
  });
  const breakdown = CATEGORIES.filter((c) => (byCat[c] ?? 0) > 0);

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

          {total > 0 && (
            <div className={`capacity${over ? " capacity--over" : ""}`}>
              <div className="capacity__head">
                <span className="capacity__label">{t.capacity.label}</span>
                <span className="capacity__nums">
                  {t.capacity.fmt(plannedMin)} / {t.capacity.fmt(availableMin)}
                </span>
              </div>
              <div className="capacity__bar">
                <div
                  className="capacity__fill"
                  style={{ width: `${loadPct}%` }}
                />
              </div>
              {breakdown.length > 0 && (
                <div className="capacity__breakdown">
                  {breakdown.map((c) => (
                    <span key={c} className="cat-chip">
                      <span className={`cat-dot cat--${c}`} aria-hidden />
                      {t.cat[c]} {t.capacity.fmt(byCat[c])}
                    </span>
                  ))}
                </div>
              )}
              <div className="capacity__foot">
                <span className="capacity__msg">
                  {over
                    ? t.capacity.over
                    : unestimated > 0
                      ? t.capacity.noEstimate(unestimated)
                      : ""}
                </span>
                <div className="capacity__stepper">
                  <button
                    type="button"
                    onClick={decrease}
                    aria-label="Less time available"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={increase}
                    aria-label="More time available"
                  >
                    +
                  </button>
                </div>
              </div>
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
            {sortedToday.map((task) => {
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
                  <div className="task__body">
                    <span
                      className={`task__title${done ? " task__title--done" : ""}`}
                    >
                      {task.title}
                    </span>
                    <span className="task__meta">
                      <span className={`prio prio--${task.priority}`}>
                        {t.prio[task.priority]}
                      </span>
                      <button
                        type="button"
                        className="chip-edit"
                        onClick={() => cycleEstimate(task.id)}
                        aria-label="Edit time estimate"
                      >
                        {task.estimateMin != null
                          ? t.meta.min(task.estimateMin)
                          : t.meta.setTime}
                      </button>
                    </span>
                  </div>
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
