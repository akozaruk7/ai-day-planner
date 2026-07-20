"use client";

import { useCaptureDraft } from "@/lib/useTasks";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();

  const isEmpty = draft.trim().length === 0;

  // AI parsing isn't wired up yet — this is the skeleton.
  const handleMic = () => {
    // Edge case: empty dump — nudge instead of doing nothing silently.
    if (isEmpty) {
      alert("Nothing to capture yet — write or dictate something first ✍️");
      return;
    }
    alert("Voice input & AI parsing — coming soon 🎙️");
  };

  return (
    <main className="screen">
      <div className="capture">
        <textarea
          className="capture__input"
          placeholder="What's on your mind?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          aria-label="What's on your mind?"
        />

        <div className="capture__actions">
          <button
            type="button"
            className="mic"
            onClick={handleMic}
            aria-label="Dictate by voice"
          >
            🎙️
          </button>
          <span className="mic__hint">
            {isEmpty
              ? "Type or tap the mic — AI will sort it into tasks"
              : "Tap the mic to turn this into tasks"}
          </span>
        </div>
      </div>
    </main>
  );
}
