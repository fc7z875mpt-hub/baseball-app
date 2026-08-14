"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatAvg } from "@/lib/stats";

type PlayerCard = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
  category: string | null;
  team: {
    id: string;
    name: string;
    shortName: string | null;
    primaryColor: string;
  } | null;
  stats: {
    games: number;
    hits: number;
    runs: number;
    homeRuns: number;
    avg: number | null;
  };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/players/me")
      .then((r) => r.json())
      .then((d) => setPlayers(d.players || []))
      .catch(() => setPlayers([]))
      .finally(() => setLoadingPlayers(false));
  }, [status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">
        Načítám…
      </main>
    );
  }

  const user = session?.user as {
    firstName?: string;
    name?: string;
    role?: string;
  };
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
            <p className="mt-1 text-xs uppercase tracking-wide text-white/40">
              {user?.role}
            </p>
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
              <p className="text-sm text-white/50">
                Schvalování, týmy, sezóny, demo data
              </p>
            </Link>
          )}

          <section>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
              {isStaffLabel(user?.role)} – hráči
            </h2>

            {loadingPlayers && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
                Načítám hráče…
              </div>
            )}

            {!loadingPlayers && players.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">Zatím žádný hráč</p>
                <p className="mt-1 text-sm text-white/50">
                  Po schválení registrace se zde zobrazí profil dítěte a statistiky.
                </p>
              </div>
            )}

            {players.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/player/${p.id}`}
                className="mb-2 block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{
                        backgroundColor: p.team?.primaryColor || "#1e3a5f",
                      }}
                    >
                      {p.jerseyNumber != null ? `#${p.jerseyNumber}` : initials(p)}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-sm text-white/50">
                        {[p.team?.name, p.category].filter(Boolean).join(" · ") ||
                          "Bez týmu"}
                      </p>
                    </div>
                  </div>
                  <span className="text-white/30">→</span>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-white/5 pt-3">
                  <MiniStat label="G" value={p.stats.games} />
                  <MiniStat label="H" value={p.stats.hits} />
                  <MiniStat label="HR" value={p.stats.homeRuns} />
                  <MiniStat label="AVG" value={formatAvg(p.stats.avg)} />
                </div>
              </Link>
            ))}
          </section>

          {isOrganizer && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 opacity-70">
              <p className="font-semibold">Zápis zápasu</p>
              <p className="mt-1 text-sm text-white/50">
                Připravujeme – živý scoring na mobilu (fáze 4)
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 opacity-70">
            <p className="font-semibold">Kalendář zápasů</p>
            <p className="mt-1 text-sm text-white/50">Připravujeme – výsledky a program</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold tabular-nums text-white">{value}</p>
      <p className="text-[10px] uppercase text-white/40">{label}</p>
    </div>
  );
}

function initials(p: { firstName: string; lastName: string }) {
  return `${p.firstName[0] || ""}${p.lastName[0] || ""}`.toUpperCase();
}

function isStaffLabel(role?: string) {
  if (role === "ADMIN" || role === "ORGANIZER") return "Přehled";
  return "Moje děti";
}
