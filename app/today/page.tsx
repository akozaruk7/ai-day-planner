"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTasks, useDayBudget } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import Mascot from "@/components/Mascot";
import { CATEGORIES } from "@/lib/types";

export default function TodayPage() {
  const {
    today,
    inbox,
    doneCount,
    loaded,
    toggleDone,
    moveToInbox,
    cycleEstimate,
    endDay,
  } = useTasks();
  const { bedtimeMin, increase, decrease } = useDayBudget();
  const { t, lang } = useLang();

  const [ending, setEnding] = useState(false);
  const [toast, setToast] = useState("");

  // Поточна дата рахуємо лише на клієнті (щоб не було hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dateLabel = mounted
    ? new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : "en-US", {
        day: "numeric",
        month: "long",
      }).format(new Date())
    : "";

  // Автозникнення тоста.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  function finishDay(carry: boolean) {
    const msg =
      unfinished === 0
        ? t.endDay.toastAllDone
        : carry
          ? t.endDay.toastCarry(unfinished)
          : t.endDay.toastInbox(unfinished);
    endDay(carry);
    setEnding(false);
    setToast(msg);
  }

  // Список від найпріоритетніших до менш пріоритетних (стабільне сортування).
  const prioWeight = { high: 3, medium: 2, low: 1 } as const;
  const sortedToday = [...today].sort(
    (a, b) => prioWeight[b.priority] - prioWeight[a.priority]
  );

  const total = today.length;
  const allDone = total > 0 && doneCount === total;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const unfinished = total - doneCount;

  // Навантаження дня: сума оцінок задач Today проти бюджету часу.
  const plannedMin = today.reduce((sum, tk) => sum + (tk.estimateMin ?? 0), 0);
  const unestimated = today.filter((tk) => tk.estimateMin == null).length;
  // Доступний час = від «зараз» до сну, обмежено 16 год неспання.
  const nowMin = mounted
    ? new Date().getHours() * 60 + new Date().getMinutes()
    : 0;
  const availableMin = Math.max(0, Math.min(16 * 60, bedtimeMin - nowMin));
  const over = plannedMin > availableMin;
  const loadPct =
    availableMin > 0 ? Math.min(100, Math.round((plannedMin / availableMin) * 100)) : 0;
  const bedtimeLabel = `${String(Math.floor(bedtimeMin / 60)).padStart(2, "0")}:${String(
    bedtimeMin % 60
  ).padStart(2, "0")}`;

  // Розбивка дня по категоріях (лише присутні, у сталому порядку).
  const byCat: Record<string, number> = {};
  today.forEach((tk) => {
    byCat[tk.category] = (byCat[tk.category] ?? 0) + (tk.estimateMin ?? 0);
  });
  const breakdown = CATEGORIES.filter((c) => (byCat[c] ?? 0) > 0);

  return (
    <main className="screen">
      <div className="screen__head">
        <div className="screen__titlewrap">
          <Mascot state={allDone ? "happy" : "calm"} size={52} />
          <h1 className="screen__title">{t.today.title}</h1>
          {dateLabel && <span className="screen__date">{dateLabel}</span>}
        </div>
        <Link href="/history" className="history-link">
          {t.history.link}
        </Link>
      </div>
      <p className="screen__subtitle">{t.today.subtitle}</p>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {/* Порожні стани: є задачі у Вхідних (пояснення) vs зовсім порожньо (онбординг) */}
      {loaded && total === 0 ? (
        inbox.length > 0 ? (
          <div className="empty">
            <span className="empty__icon" aria-hidden>
              <Mascot state="thinking" size={64} />
            </span>
            <span className="empty__title">{t.today.emptyInboxTitle}</span>
            <span className="empty__text">
              {t.today.emptyInboxText(inbox.length)}
            </span>
            <Link href="/inbox" className="cta">
              {t.today.emptyInboxCta}
            </Link>
          </div>
        ) : (
          <div className="empty">
            <span className="empty__icon" aria-hidden>
              <Mascot state="calm" size={64} />
            </span>
            <span className="empty__title">{t.today.emptyTitle}</span>
            <span className="empty__text">{t.today.emptyText}</span>
            <Link href="/capture" className="cta">
              {t.today.cta}
            </Link>
          </div>
        )
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
                  <span className="capacity__bedtime">🌙 {bedtimeLabel}</span>
                  <button
                    type="button"
                    onClick={decrease}
                    aria-label="Earlier bedtime"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={increase}
                    aria-label="Later bedtime"
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
                <Mascot state="happy" size={64} />
              </span>
              <span className="celebrate__title">{t.today.celebrateTitle}</span>
              <span className="celebrate__text">{t.celebrateText(total)}</span>
            </div>
          )}

          <ul className="task-list">
            {sortedToday.map((task) => {
              const done = task.status === "done";
              return (
                <li key={task.id} className={`task task--${task.priority}`}>
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
                        aria-label={t.meta.editTimeHint}
                        title={t.meta.editTimeHint}
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

          <button
            type="button"
            className="end-day-btn"
            onClick={() => setEnding(true)}
          >
            {t.endDay.button}
          </button>
        </>
      )}

      {ending && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <span className="modal__icon" aria-hidden>
              <Mascot state={unfinished === 0 ? "happy" : "night"} size={56} />
            </span>
            <h2 className="modal__title">{t.endDay.title}</h2>
            <p className="modal__done">{t.endDay.done(doneCount, total)}</p>

            {unfinished === 0 ? (
              <>
                <p className="modal__msg">{t.endDay.allDone}</p>
                <button
                  type="button"
                  className="modal__btn modal__btn--primary"
                  onClick={() => finishDay(true)}
                >
                  {t.endDay.button}
                </button>
              </>
            ) : (
              <>
                <p className="modal__msg">{t.endDay.unfinishedQ(unfinished)}</p>
                <button
                  type="button"
                  className="modal__btn modal__btn--primary"
                  onClick={() => finishDay(true)}
                >
                  {t.endDay.carry}
                </button>
                <button
                  type="button"
                  className="modal__btn"
                  onClick={() => finishDay(false)}
                >
                  {t.endDay.toInbox}
                </button>
              </>
            )}

            <button
              type="button"
              className="modal__cancel"
              onClick={() => setEnding(false)}
            >
              {t.endDay.cancel}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
