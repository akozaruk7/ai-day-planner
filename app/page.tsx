"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";

// Стартова точка: перший запуск → онбординг, далі → Capture.
export default function Home() {
  const { profile, loaded } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;
    router.replace(profile.onboarded ? "/capture" : "/welcome");
  }, [loaded, profile.onboarded, router]);

  return null;
}
