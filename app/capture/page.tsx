"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCaptureDraft, useTasks } from "@/lib/useTasks";
import type { ParsedTask } from "@/lib/types";

type Phase = "idle" | "loading" | "error";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();
  const { addParsed } = useTasks();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const isEmpty = draft.trim().length === 0;

  async function handleParse() {
    if (isEmpty || phase === "loading") return;
    setPhase("loading");
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { tasks: ParsedTask[] };
      addParsed(data.tasks ?? []);
      setDraft(""); // очищаємо поле після успішного розбору
      setPhase("idle");
      router.push("/inbox"); // ведемо туди, де зʼявилися задачі
    } catch {
      // Edge-case #4: помилка AI/мережі — зрозуміле повідомлення, не білий екран.
      setPhase("error");
    }
  }

  return (
    <main className="screen">
      <div className="capture">
        <textarea
          className="capture__input"
          placeholder="What's on your mind?"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (phase === "error") setPhase("idle");
          }}
          disabled={phase === "loading"}
          autoFocus
          aria-label="What's on your mind?"
        />

        <div className="capture__actions">
          {phase === "error" && (
            <div className="banner banner--error" role="alert">
              <span>Couldn&apos;t reach the AI. Check your connection and try again.</span>
              <button
                type="button"
                className="banner__retry"
                onClick={handleParse}
              >
                Retry
              </button>
            </div>
          )}

          <button
            type="button"
            className="parse-btn"
            onClick={handleParse}
            disabled={isEmpty || phase === "loading"}
          >
            {phase === "loading" ? "Sorting into tasks…" : "✨ Sort into tasks"}
          </button>
          <span className="mic__hint">
            {isEmpty
              ? "Dump everything — AI turns it into structured tasks"
              : "AI will split this into tasks with priority & deadlines"}
          </span>
        </div>
      </div>
    </main>
  );
}
