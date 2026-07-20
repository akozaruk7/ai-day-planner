"use client";

import { useTasks } from "@/lib/useTasks";

export default function TodayPage() {
  const { today, loaded, toggleDone } = useTasks();

  return (
    <main className="screen">
      <h1 className="screen__title">Сьогодні</h1>
      <p className="screen__subtitle">Чекліст задач на сьогодні</p>

      {loaded && today.length === 0 ? (
        <div className="empty">
          <span className="empty__icon" aria-hidden>
            ✅
          </span>
          <span className="empty__title">На сьогодні нічого</span>
          <span className="empty__text">
            Заплановані на сьогодні задачі зʼявляться тут як чекліст.
          </span>
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
                  aria-label={done ? "Зняти позначку" : "Позначити виконаною"}
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
