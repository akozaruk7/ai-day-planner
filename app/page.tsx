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
    if (!profile.onboarded) router.replace("/welcome");
    else if (!profile.tourSeen) router.replace("/tour");
    else router.replace("/capture");
  }, [loaded, profile.onboarded, profile.tourSeen, router]);

  return null;
}
