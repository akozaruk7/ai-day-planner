// Скетч-іконки: власні мінімальні інлайн-SVG (не тягнемо зовнішній пакет).
// Стиль: stroke=currentColor, fill=none, округлі кінці — «олівцевий» вигляд.
// Колір успадковується від батька (currentColor), тож активна вкладка підсвічується як є.

type IconName = "capture" | "inbox" | "today" | "history" | "mic";

export default function Icon({
  name,
  size = 22,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "capture":
      return (
        <svg {...common}>
          <path d="M4 20l3-.7L18.5 7.8a2 2 0 0 0-2.8-2.8L4.2 16.5 4 20z" />
          <path d="M14.5 6.5l3 3" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M4 13l2.5-7h11L20 13" />
          <path d="M4 13h5l1.5 3h3L14 13h6v5H4z" />
        </svg>
      );
    case "today":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="2.5" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
          <path d="M12 17.5V21" />
          <path d="M8.5 21h7" />
        </svg>
      );
  }
}
