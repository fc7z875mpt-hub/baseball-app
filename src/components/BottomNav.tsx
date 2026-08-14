"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSettings } from "@/components/Icons";

type Role = "PARENT" | "ORGANIZER" | "ADMIN" | string | undefined;

export function BottomNav({
  role,
  playerHref = "/dashboard/players",
}: {
  role?: Role;
  playerHref?: string;
}) {
  const path = usePathname();
  const isOrg = role === "ORGANIZER";
  const isAdmin = role === "ADMIN";

  type Item = {
    href: string;
    label: string;
    match?: string;
    icon: () => React.ReactNode;
  };

  const items: Item[] = [
    {
      href: "/dashboard",
      label: "Domů",
      match: "exact",
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      ),
    },
  ];

  if (isOrg || isAdmin) {
    items.push({
      href: "/dashboard/score",
      label: "Zápis",
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    });
  } else {
    items.push({
      href: playerHref,
      label: "Hráč",
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 14.5-4 16 0" />
        </svg>
      ),
    });
  }

  items.push({
    href: "/dashboard/matches",
    label: "Zápasy",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 8.5 12 22l8-13.5Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  });

  if (isAdmin) {
    items.push({
      href: "/admin",
      label: "Admin",
      icon: () => <IconSettings size={22} />,
    });
  } else {
    items.push({
      href: "/dashboard/profile",
      label: "Nastavení",
      icon: () => <IconSettings size={22} />,
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070f1c]/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            item.match === "exact"
              ? path === "/dashboard" || path === "/dashboard/"
              : path.startsWith(item.href);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
                active ? "text-sky-400" : "text-white/40 hover:text-white/65"
              }`}
            >
              <span>{item.icon()}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
