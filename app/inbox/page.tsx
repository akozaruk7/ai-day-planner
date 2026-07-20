"use client";

import Link from "next/link";
import { useTasks } from "@/lib/useTasks";

export default function InboxPage() {
  const { inbox, loaded, toggleDone } = useTasks();

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
            <li key={task.id} className="task">
              <button
                type="button"
                className="task__check"
                onClick={() => toggleDone(task.id)}
                aria-label="Mark as done"
              />
              <span className="task__title">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
