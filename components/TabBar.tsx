"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/LanguageContext";

export default function TabBar() {
  const pathname = usePathname();
  const { t } = useLang();

  const tabs = [
    { href: "/capture", label: t.tab.capture, icon: "✍️" },
    { href: "/inbox", label: t.tab.inbox, icon: "📥" },
    { href: "/today", label: t.tab.today, icon: "✅" },
  ];

  return (
    <nav className="tabbar" aria-label="Main navigation">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tabbar__item${active ? " tabbar__item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="tabbar__icon" aria-hidden>
              {tab.icon}
            </span>
            <span className="tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
