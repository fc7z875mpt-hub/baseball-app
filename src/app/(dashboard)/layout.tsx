"use client";

import { useSession } from "next-auth/react";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="pb-24">{children}</div>
      {session && <BottomNav role={role} />}
    </div>
  );
}
