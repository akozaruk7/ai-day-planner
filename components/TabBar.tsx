"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: string;
};

const TABS: Tab[] = [
  { href: "/capture", label: "Capture", icon: "✍️" },
  { href: "/inbox", label: "Inbox", icon: "📥" },
  { href: "/today", label: "Today", icon: "✅" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tabbar" aria-label="Main navigation">
      {TABS.map((tab) => {
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
