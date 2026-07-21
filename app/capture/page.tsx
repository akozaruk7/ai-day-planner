"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCaptureDraft, useTasks, useDayBudget } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import type { ParsedTask } from "@/lib/types";

type Phase = "idle" | "loading" | "error";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();
  const { addParsed } = useTasks();
  const { bedtimeMin } = useDayBudget();
  const { t, lang } = useLang();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const isEmpty = draft.trim().length === 0;

  // --- Голосовий ввід (браузерний Web Speech API) ---
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    // Fallback: якщо браузер не підтримує розпізнавання — просто не показуємо мікрофон.
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition);
    setMicSupported(!!SR);
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  function toggleMic() {
    if (!micSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    if (phase === "error") setPhase("idle");

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === "uk" ? "uk-UA" : "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    baseTextRef.current = draft ? draft + " " : "";
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setDraft(baseTextRef.current + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  async function handleParse() {
    if (isEmpty || phase === "loading") return;
    recognitionRef.current?.stop(); // зупиняємо диктування перед розбором
    setPhase("loading");
    // Залишок часу до сну (як на Today) — щоб AI не переобіцяв на сьогодні.
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const availableMin = Math.max(0, Math.min(16 * 60, bedtimeMin - nowMin));
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft, lang, availableMin }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { tasks: ParsedTask[] };
      const inboxIds = addParsed(data.tasks ?? []);
      setDraft("");
      setPhase("idle");
      if (inboxIds.length > 0) {
        // Є що сортувати → крок тріажу.
        try {
          localStorage.setItem(
            "ai-planner:triage-batch",
            JSON.stringify(inboxIds)
          );
        } catch {
          // ignore
        }
        router.push("/triage");
      } else {
        router.push("/today");
      }
    } catch {
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

          {micSupported && (
            <button
              type="button"
              className={`mic-btn${listening ? " mic-btn--on" : ""}`}
              onClick={toggleMic}
              disabled={phase === "loading"}
            >
              {listening ? t.capture.listening : t.capture.mic}
            </button>
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
