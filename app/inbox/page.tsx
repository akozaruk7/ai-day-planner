"use client";

import { useTasks } from "@/lib/useTasks";

export default function InboxPage() {
  const { inbox, loaded, toggleDone } = useTasks();

  return (
    <main className="screen">
      <h1 className="screen__title">Вхідні</h1>
      <p className="screen__subtitle">Розпарсені задачі, які ще не заплановані</p>

      {loaded && inbox.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            📥
          </span>
          <span className="empty__title">Поки порожньо</span>
          <span className="empty__text">
            Захопи думки на екрані «Захопити» — розпарсені задачі зʼявляться тут.
          </span>
        </div>
      ) : (
        <ul className="task-list">
          {inbox.map((task) => (
            <li key={task.id} className="task">
              <button
                type="button"
                className="task__check"
                onClick={() => toggleDone(task.id)}
                aria-label="Позначити виконаною"
              />
              <span className="task__title">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
