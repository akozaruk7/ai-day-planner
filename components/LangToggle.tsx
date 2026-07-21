"use client";

import { useLang } from "@/lib/LanguageContext";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="langtoggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`langtoggle__btn${lang === "uk" ? " langtoggle__btn--on" : ""}`}
        onClick={() => setLang("uk")}
        aria-pressed={lang === "uk"}
      >
        UA
      </button>
      <button
        type="button"
        className={`langtoggle__btn${lang === "en" ? " langtoggle__btn--on" : ""}`}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
