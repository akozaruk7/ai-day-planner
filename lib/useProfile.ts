"use client";

import { useCallback, useEffect, useState } from "react";

const PROFILE_KEY = "ai-planner:profile";

export interface Profile {
  name: string;
  onboarded: boolean;
  tourSeen: boolean;
}

const EMPTY: Profile = { name: "", onboarded: false, tourSeen: false };

/**
 * Профіль користувача (імʼя + чи пройдено онбординг), persist у localStorage.
 * Час сну зберігається окремо в useDayBudget.
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Profile>;
        setProfile({
          name: typeof parsed.name === "string" ? parsed.name : "",
          onboarded: parsed.onboarded === true,
          tourSeen: parsed.tourSeen === true,
        });
      }
    } catch {
      // пошкоджені дані — лишаємо порожній профіль
    }
    setLoaded(true);
  }, []);

  // Зберегти часткові зміни (напр. { name } або { onboarded: true }).
  const save = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {
        // квота/приватний режим — тихо ігноруємо
      }
      return next;
    });
  }, []);

  return { profile, loaded, save };
}
