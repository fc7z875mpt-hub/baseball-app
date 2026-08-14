"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "PARENT" | "ORGANIZER" | "ADMIN" | string | undefined;

export function BottomNav({ role }: { role?: Role }) {
  const path = usePathname();
  const isOrg = role === "ORGANIZER" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const items: { href: string; label: string; icon: string; match?: string }[] = [
    { href: "/dashboard", label: "Domů", icon: "⌂", match: "/dashboard" },
    { href: "/dashboard/matches", label: "Zápasy", icon: "📅" },
  ];

  if (isOrg) {
    items.push({ href: "/dashboard/score", label: "Zápis", icon: "✎" });
  }

  // Hráči až dole – rodič své děti, admin/org oddělená stránka (ne na dashboardu)
  items.push({ href: "/dashboard/players", label: "Hráči", icon: "◎" });

  if (isAdmin) {
    items.push({ href: "/admin", label: "Admin", icon: "⚙" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a1628]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            item.match === "/dashboard"
              ? path === "/dashboard"
              : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${
                active ? "text-red-400" : "text-white/45 hover:text-white/70"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
