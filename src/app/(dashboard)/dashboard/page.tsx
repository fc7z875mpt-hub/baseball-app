"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">
        Načítám…
      </main>
    );
  }

  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";
  const isOrganizer = user?.role === "ORGANIZER" || isAdmin;

  return (
    <main className="min-h-screen bg-[#0a1628] px-4 py-8 text-white">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Ahoj,</p>
            <h1 className="text-2xl font-bold">
              {user?.firstName || user?.name || "Uživateli"}
            </h1>
            <p className="mt-1 text-xs text-white/40">{user?.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Odhlásit
          </button>
        </div>

        <div className="space-y-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="block rounded-2xl border border-red-500/30 bg-red-600/10 p-4 transition hover:bg-red-600/20"
            >
              <p className="font-semibold text-red-400">Admin panel</p>
              <p className="text-sm text-white/50">Schvalování registrací, role, týmy</p>
            </Link>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold">Statistiky dítěte</p>
            <p className="mt-1 text-sm text-white/50">Brzy – přehled výkonu a zápasy</p>
          </div>

          {isOrganizer && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-semibold">Zápis zápasu</p>
              <p className="mt-1 text-sm text-white/50">Brzy – živý scoring na mobilu</p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold">Zápasy</p>
            <p className="mt-1 text-sm text-white/50">Brzy – kalendář a výsledky</p>
          </div>
        </div>
      </div>
    </main>
  );
}
