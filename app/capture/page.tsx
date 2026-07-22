"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCaptureDraft, useTasks, useDayBudget } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import { useProfile } from "@/lib/useProfile";
import Mascot from "@/components/Mascot";
import Icon from "@/components/Icon";
import type { ParsedTask } from "@/lib/types";

type Phase = "idle" | "loading" | "error";

export default function CapturePage() {
  const { draft, setDraft } = useCaptureDraft();
  const { addParsed, splitByExisting } = useTasks();
  const { planStartMin, planEndMin, windowMin } = useDayBudget();
  const { t, lang } = useLang();
  const { profile } = useProfile();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [dupPrompt, setDupPrompt] = useState<ParsedTask[]>([]);
  const isEmpty = draft.trim().length === 0;

  // Персональне привітання (лише на клієнті — щоб не було hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const greeting = mounted
    ? t.greeting(profile.name, new Date().getHours())
    : "";

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
    const availableMin = Math.max(
      0,
      Math.min(windowMin, planEndMin - Math.max(nowMin, planStartMin))
    );
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft, lang, availableMin }),
      });

      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = (await res.json()) as { tasks: ParsedTask[] };
      const { fresh, dups } = splitByExisting(data.tasks ?? []);
      addParsed(fresh);
      setDraft("");
      setPhase("idle");
      if (dups.length > 0) {
        setDupPrompt(dups); // спитати, чи додавати дублікати
      } else {
        router.push("/today"); // одразу показуємо день
      }
    } catch {
      setPhase("error");
    }
  }

  // Користувач підтвердив додавання дублікатів.
  function confirmDups() {
    addParsed(dupPrompt);
    setDupPrompt([]);
    router.push("/today");
  }

  // Користувач вирішив не додавати дублікати.
  function skipDups() {
    setDupPrompt([]);
    router.push("/today");
  }

  return (
    <main className="screen">
      <div className="capture">
        <div className="capture__hello">
          <Mascot state="calm" size={64} />
          {greeting && <p className="capture__greeting">{greeting}</p>}
          <p className="capture__invite">{t.capture.hintEmpty}</p>
        </div>
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

        {micSupported && (
          <div className="capture__voice">
            <button
              type="button"
              className={`mic-btn${listening ? " mic-btn--on" : ""}`}
              onClick={toggleMic}
              disabled={phase === "loading"}
              aria-label={listening ? t.capture.listening : t.capture.mic}
            >
              <Icon name="mic" size={68} />
            </button>
            {(listening || !isEmpty) && (
              <span className="mic__hint">
                {listening ? t.capture.listening : t.capture.hintFilled}
              </span>
            )}
          </div>
        )}

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
        </div>
      </div>

      {dupPrompt.length > 0 && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal__title">{t.capture.dupTitle}</h2>
            <ul className="modal__dups">
              {dupPrompt.map((p, i) => (
                <li key={i}>{p.title}</li>
              ))}
            </ul>
            <p className="modal__msg">{t.capture.dupText}</p>
            <button
              type="button"
              className="modal__btn modal__btn--primary"
              onClick={confirmDups}
            >
              {t.capture.dupAdd}
            </button>
            <button type="button" className="modal__btn" onClick={skipDups}>
              {t.capture.dupSkip}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
