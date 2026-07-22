"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/useProfile";
import { useLang } from "@/lib/LanguageContext";
import Mascot from "@/components/Mascot";

const MASCOT_STATES = ["calm", "thinking", "happy", "calm"] as const;

export default function TourPage() {
  const { save } = useProfile();
  const { t } = useLang();
  const router = useRouter();
  const [i, setI] = useState(0);

  const slides = t.tour.slides;
  const last = i === slides.length - 1;
  const slide = slides[i];

  function finish() {
    save({ tourSeen: true });
    router.push("/capture");
  }

  function next() {
    if (last) finish();
    else setI((n) => n + 1);
  }

  return (
    <main className="screen">
      <div className="tour">
        <button type="button" className="tour__skip" onClick={finish}>
          {t.tour.skip}
        </button>

        <div className="tour__body">
          <Mascot state={MASCOT_STATES[i] ?? "calm"} size={108} />
          <h1 className="tour__title">{slide.title}</h1>
          <p className="tour__text">{slide.text}</p>
        </div>

        <div className="tour__dots" aria-hidden>
          {slides.map((_, k) => (
            <span
              key={k}
              className={`tour__dot${k === i ? " tour__dot--on" : ""}`}
            />
          ))}
        </div>

        <button type="button" className="tour__next" onClick={next}>
          {last ? t.tour.done : t.tour.next}
        </button>
      </div>
    </main>
  );
}
