// Маскот Ладо — керований SVG зі станами (calm | thinking | happy | night).
// Стани міняють лише дрібні деталі (рот, очі). «Дихання» (bob) — у globals.css,
// вимикається через prefers-reduced-motion. Декоративний: aria-hidden.

type MascotState = "calm" | "thinking" | "happy" | "night";

export default function Mascot({
  state = "calm",
  size = 60,
}: {
  state?: MascotState;
  size?: number;
}) {
  const mouth =
    state === "happy"
      ? "M40 60 Q51 74 62 59"
      : state === "night"
        ? "M43 64 Q51 68 60 64"
        : "M43 62 Q51 70 60 61";
  return (
    <svg
      className={`mascot mascot--${state}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
    >
      <ellipse cx="50" cy="93" rx="26" ry="5" fill="var(--shadow)" />
      <path
        d="M24 52 C22 30 40 16 50 16 C60 16 78 30 76 52 C74 74 62 84 50 84 C38 84 26 74 24 52 Z"
        fill="var(--violet)"
        stroke="var(--sketch)"
        strokeWidth="3"
      />
      <path
        d="M40 22 C36 12 30 12 30 12"
        fill="none"
        stroke="var(--sketch)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {state === "night" ? (
        <>
          <path
            d="M38 50 q4 3 8 0"
            fill="none"
            stroke="var(--sketch)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M56 50 q4 3 8 0"
            fill="none"
            stroke="var(--sketch)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="42" cy="50" r="4.5" fill="#fff" />
          <circle cx="43" cy="51" r="2.3" fill="var(--sketch)" />
          <circle cx="60" cy="50" r="4.5" fill="#fff" />
          <circle cx="61" cy="51" r="2.3" fill="var(--sketch)" />
        </>
      )}
      <path
        d={mouth}
        fill="none"
        stroke="var(--sketch)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {state === "thinking" && (
        <g fill="var(--ink-soft)">
          <circle cx="80" cy="30" r="2.5" />
          <circle cx="87" cy="26" r="2" />
        </g>
      )}
      {state === "happy" && (
        <g fill="var(--accent)" opacity=".6">
          <circle cx="34" cy="60" r="4" />
          <circle cx="68" cy="60" r="4" />
        </g>
      )}
    </svg>
  );
}
