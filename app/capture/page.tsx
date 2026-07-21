"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCaptureDraft, useTasks } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import type { ParsedTask } from "@/lib/types";

type Phase = "idle" | "loading" | "error";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();
  const { addParsed } = useTasks();
  const { t, lang } = useLang();
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
        body: JSON.stringify({ text: draft, lang }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { tasks: ParsedTask[] };
      addParsed(data.tasks ?? []);
      setDraft(""); // очищаємо поле після успішного розбору
      setPhase("idle");
      router.push("/today"); // одразу показуємо день
    } catch {
      // Edge-case: помилка AI/мережі — зрозуміле повідомлення, не білий екран.
      setPhase("error");
    }
  }

  return (
    <main className="screen">
      <div className="capture">
        <textarea
          className="capture__input"
          placeholder={t.capture.placeholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (phase === "error") setPhase("idle");
          }}
          disabled={phase === "loading"}
          autoFocus
          aria-label={t.capture.placeholder}
        />

        <div className="capture__actions">
          {phase === "error" && (
            <div className="banner banner--error" role="alert">
              <span>{t.capture.error}</span>
              <button
                type="button"
                className="banner__retry"
                onClick={handleParse}
              >
                {t.capture.retry}
              </button>
            </div>
          )}

          <button
            type="button"
            className="parse-btn"
            onClick={handleParse}
            disabled={isEmpty || phase === "loading"}
          >
            {phase === "loading" ? t.capture.sorting : t.capture.sort}
          </button>
          <span className="mic__hint">
            {isEmpty ? t.capture.hintEmpty : t.capture.hintFilled}
          </span>
        </div>
      </div>
    </main>
  );
}
