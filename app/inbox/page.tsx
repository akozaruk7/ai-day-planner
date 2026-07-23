"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import Mascot from "@/components/Mascot";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";

type Filter = Category | "all";

export default function InboxPage() {
  const {
    inbox,
    loaded,
    moveToToday,
    toggleDone,
    cycleEstimate,
    setDeadline,
    cyclePriority,
  } = useTasks();
  const { t } = useLang();

  const [filter, setFilter] = useState<Filter>("all");

  // Категорії, що реально присутні у Вхідних (сталий порядок) + лічильники.
  const present = useMemo(
    () => CATEGORIES.filter((c) => inbox.some((task) => task.category === c)),
    [inbox]
  );
  const counts = useMemo(() => {
    const map = {} as Record<Category, number>;
    for (const task of inbox) {
      map[task.category] = (map[task.category] ?? 0) + 1;
    }
    return map;
  }, [inbox]);

  // Якщо вибрана категорія зникла зі списку — авто-скидання на «Всі».
  useEffect(() => {
    if (filter !== "all" && !present.includes(filter)) {
      setFilter("all");
    }
  }, [present, filter]);

  const visible =
    filter === "all" ? inbox : inbox.filter((task) => task.category === filter);

  return (
    <main className="screen">
      <h1 className="screen__title">{t.inbox.title}</h1>

      {loaded && inbox.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            <Mascot state="thinking" size={64} />
          </span>
          <span className="empty__title">{t.inbox.emptyTitle}</span>
          <span className="empty__text">{t.inbox.emptyText}</span>
          <Link href="/capture" className="cta">
            {t.inbox.cta}
          </Link>
        </div>
      ) : (
        <>
          {inbox.length > 0 && (
            <div className="inbox-filters">
              <button
                type="button"
                className={`filter-chip${filter === "all" ? " filter-chip--active" : ""}`}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                {t.inbox.all}
                <span className="filter-chip__count">{inbox.length}</span>
              </button>
              {present.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`filter-chip${filter === c ? " filter-chip--active" : ""}`}
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                >
                  {t.cat[c]}
                  <span className="filter-chip__count">{counts[c]}</span>
                </button>
              ))}
            </div>
          )}

          <ul className="task-list">
            {visible.map((task) => (
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
                    <button
                      type="button"
                      className={`prio prio--${task.priority}`}
                      onClick={() => cyclePriority(task.id)}
                      aria-label={t.meta.editPrioHint}
                      title={t.meta.editPrioHint}
                    >
                      {t.prio[task.priority]}
                    </button>
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
                    {task.deadline ? (
                      <input
                        type="date"
                        className="chip-date chip-date--set"
                        value={task.deadline}
                        onChange={(e) =>
                          setDeadline(task.id, e.target.value || null)
                        }
                        aria-label={t.meta.dueEdit}
                        title={t.meta.dueEdit}
                      />
                    ) : (
                      <label className="chip-date--empty">
                        📅 {t.meta.addDeadline}
                        <input
                          type="date"
                          className="chip-date__hidden"
                          value=""
                          onChange={(e) =>
                            setDeadline(task.id, e.target.value || null)
                          }
                          aria-label={t.meta.addDeadline}
                        />
                      </label>
                    )}
                    {task.suggested && (
                      <span className="badge">{t.inbox.badge}</span>
                    )}
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
        </>
      )}
    </main>
  );
}
