"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Кнопка «?» у топбарі — відкриває тур будь-коли.
// Ховаємо на онбордингу/турі/стартовому редіректі.
export default function HelpLink() {
  const pathname = usePathname();
  if (pathname === "/welcome" || pathname === "/tour" || pathname === "/") {
    return null;
  }
  return (
    <Link href="/tour" className="help-btn" aria-label="Як це працює">
      ?
    </Link>
  );
}
