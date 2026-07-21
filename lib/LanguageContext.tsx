"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dict, type Lang, type Strings } from "./i18n";

const LANG_KEY = "ai-planner:lang";

interface LangValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
}

const LangContext = createContext<LangValue>({
  lang: "uk",
  setLang: () => {},
  t: dict.uk,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Стартуємо з "uk" на сервері й клієнті (щоб не було hydration mismatch),
  // потім читаємо збережений вибір після монтування.
  const [lang, setLangState] = useState<Lang>("uk");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "uk" || saved === "en") setLangState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // ignore
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
