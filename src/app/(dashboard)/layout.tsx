"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [playerHref, setPlayerHref] = useState("/dashboard/players");

  useEffect(() => {
    if (!session || role === "ADMIN" || role === "ORGANIZER") return;
    fetch("/api/players/me")
      .then((r) => r.json())
      .then((d) => {
        const list = d.players || [];
        if (list.length === 1) {
          setPlayerHref(`/dashboard/player/${list[0].id}`);
        }
      })
      .catch(() => {});
  }, [session, role]);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="pb-24">{children}</div>
      {session && <BottomNav role={role} playerHref={playerHref} />}
    </div>
  );
}
