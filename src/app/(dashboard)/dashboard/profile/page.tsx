"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">
        Načítám…
      </main>
    );
  }

  const user = session?.user as {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    role?: string;
  };

  const roleLabel =
    user?.role === "ADMIN"
      ? "Administrátor"
      : user?.role === "ORGANIZER"
        ? "Organizátor"
        : "Rodič";

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-xl font-bold">Profil</h1>

        <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600/30 text-xl font-bold text-sky-300">
              {(user?.firstName || user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
                  user?.name ||
                  "Uživatel"}
              </p>
              <p className="text-sm text-white/45">{user?.email}</p>
              <p className="mt-0.5 text-xs text-sky-400/80">{roleLabel}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Nastavení
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1b2e]">
            <div className="border-b border-white/5 px-4 py-3.5 text-sm text-white/50">
              Oslovení a jméno – brzy (editace profilu)
            </div>
            <div className="border-b border-white/5 px-4 py-3.5 text-sm text-white/50">
              Notifikace – brzy
            </div>
            <div className="px-4 py-3.5 text-sm text-white/50">
              Změna hesla – brzy
            </div>
          </div>
        </div>

        {(user?.role === "ADMIN" || user?.role === "ORGANIZER") && (
          <Link
            href="/dashboard/score"
            className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium"
          >
            Zápis zápasu →
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium"
          >
            Admin panel →
          </Link>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/20"
        >
          Odhlásit se
        </button>
      </div>
    </main>
  );
}
