"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import { useDayBudget } from "@/lib/useTasks";
import { useLang } from "@/lib/LanguageContext";
import Mascot from "@/components/Mascot";

export default function WelcomePage() {
  const { profile, loaded, save } = useProfile();
  const { bedtimeMin, increase, decrease } = useDayBudget();
  const { t } = useLang();
  const router = useRouter();

  const [name, setName] = useState("");

  // Якщо онбординг уже пройдено — не показуємо його знову.
  useEffect(() => {
    if (loaded && profile.onboarded) {
      router.replace("/capture");
    }
  }, [loaded, profile.onboarded, router]);

  // Підхопити вже збережене імʼя, якщо користувач повертається.
  useEffect(() => {
    if (loaded && profile.name) setName(profile.name);
  }, [loaded, profile.name]);

  const bedtimeLabel = `${String(Math.floor(bedtimeMin / 60)).padStart(
    2,
    "0"
  )}:${String(bedtimeMin % 60).padStart(2, "0")}`;

  function finish() {
    save({ name: name.trim(), onboarded: true });
    router.push("/capture");
  }

  function skip() {
    save({ onboarded: true });
    router.push("/capture");
  }

  return (
    <main className="screen">
      <div className="welcome">
        <Mascot state="happy" size={96} />
        <h1 className="welcome__title">{t.welcome.title}</h1>
        <p className="welcome__subtitle">{t.welcome.subtitle}</p>

        <label className="welcome__label" htmlFor="welcome-name">
          {t.welcome.nameLabel}
        </label>
        <input
          id="welcome-name"
          className="welcome__input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.welcome.namePlaceholder}
          autoComplete="given-name"
          maxLength={40}
        />

        <div className="welcome__field">
          <span className="welcome__label">{t.welcome.bedtimeLabel}</span>
          <div className="welcome__stepper">
            <button
              type="button"
              onClick={decrease}
              aria-label={t.welcome.earlier}
            >
              −
            </button>
            <span className="welcome__bedtime">🌙 {bedtimeLabel}</span>
            <button
              type="button"
              onClick={increase}
              aria-label={t.welcome.later}
            >
              +
            </button>
          </div>
        </div>

        <button type="button" className="welcome__go" onClick={finish}>
          {t.welcome.start}
        </button>
        <button type="button" className="welcome__skip" onClick={skip}>
          {t.welcome.skip}
        </button>
      </div>
    </main>
  );
}
