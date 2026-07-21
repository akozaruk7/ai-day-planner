"use client";

import Link from "next/link";
import { useHistory } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";

export default function HistoryPage() {
  const { records, loaded } = useHistory();
  const { t } = useLang();

  return (
    <main className="screen">
      <h1 className="screen__title">{t.history.title}</h1>

      {loaded && records.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            🗓
          </span>
          <span className="empty__title">{t.history.empty}</span>
          <span className="empty__text">{t.history.emptyText}</span>
          <Link href="/today" className="cta">
            {t.today.title}
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {records.map((r) => (
            <section key={r.id} className="day-card">
              <div className="day-card__head">
                <span className="day-card__date">{r.date}</span>
                <span className="day-card__ratio">
                  {t.progress(r.done, r.total)}
                </span>
              </div>
              <ul className="day-card__items">
                {r.items.map((it, i) => (
                  <li
                    key={i}
                    className={`day-item${it.done ? " day-item--done" : ""}`}
                  >
                    <span
                      className={`cat-dot cat--${it.category}`}
                      aria-hidden
                    />
                    <span className="day-item__mark" aria-hidden>
                      {it.done ? "✓" : "○"}
                    </span>
                    <span className="day-item__title">{it.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
