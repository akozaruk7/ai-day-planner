"use client";

import { useCaptureDraft } from "@/lib/useTasks";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();

  // AI-парсинг ще не підключено — це каркас.
  const handleMic = () => {
    alert("Голосовий ввід та AI-розбір — скоро 🎙️");
  };

  return (
    <main className="screen">
      <div className="capture">
        <textarea
          className="capture__input"
          placeholder="Що в голові?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          aria-label="Що в голові?"
        />

        <div className="capture__actions">
          <button
            type="button"
            className="mic"
            onClick={handleMic}
            aria-label="Диктувати голосом"
          >
            🎙️
          </button>
          <span className="mic__hint">Натисни й говори — AI розбере на задачі</span>
        </div>
      </div>
    </main>
  );
}
