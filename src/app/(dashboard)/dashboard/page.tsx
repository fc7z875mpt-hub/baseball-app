"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatAvg } from "@/lib/stats";
import { TrendChart } from "@/components/TrendChart";

type PlayerCard = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
  category: string | null;
  team: { id: string; name: string; shortName: string | null; primaryColor: string } | null;
  stats: {
    games: number;
    hits: number;
    runs: number;
    homeRuns: number;
    avg: number | null;
  };
};

type UpcomingMatch = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { name: string; shortName: string | null; primaryColor: string };
  opponent: string;
  isHome: boolean;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [matches, setMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as { role?: string })?.role;
    const isStaff = role === "ADMIN" || role === "ORGANIZER";

    // Rodič: děti + zápasy. Admin/org: jen zápasy (hráče nenačítat – stovky záznamů).
    const tasks: Promise<void>[] = [
      fetch("/api/matches/upcoming")
        .then((r) => r.json())
        .then((d) => setMatches(d.matches || []))
        .catch(() => setMatches([])),
    ];

    if (!isStaff) {
      tasks.push(
        fetch("/api/players/me")
          .then((r) => r.json())
          .then((d) => setPlayers(d.players || []))
          .catch(() => setPlayers([]))
      );
    }

    Promise.all(tasks).finally(() => setLoading(false));
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white/60">
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
  const isStaff = user?.role === "ORGANIZER" || isAdmin;
  const child = players[0];
  const nextMatch = matches[0];

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg space-y-5">
        {/* 4.1 Uvítání */}
        <header className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/50">Ahoj,</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {user?.firstName || user?.name || "Uživateli"}
            </h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:bg-white/5"
          >
            Odhlásit
          </button>
        </header>

        {/* 4.1 Karta nejbližšího zápasu */}
        <section>
          <h2 className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Nejbližší zápas
          </h2>
          {nextMatch ? (
            <Link
              href="/dashboard/matches"
              className="block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5"
            >
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <StatusPill status={nextMatch.status} />
                    <span className="text-xs text-white/45">
                      {formatMatchDate(nextMatch.date)}
                      {nextMatch.time ? ` · ${nextMatch.time}` : ""}
                    </span>
                  </div>
                  <p className="truncate text-lg font-bold">
                    {nextMatch.homeTeam.shortName || nextMatch.homeTeam.name}
                    <span className="mx-2 text-white/30">vs</span>
                    {nextMatch.opponent}
                  </p>
                  {nextMatch.location && (
                    <p className="mt-0.5 text-xs text-white/40">{nextMatch.location}</p>
                  )}
                </div>
                {nextMatch.status === "LIVE" || nextMatch.status === "FINISHED" ? (
                  <p className="shrink-0 text-2xl font-black tabular-nums">
                    {nextMatch.homeScore}:{nextMatch.awayScore}
                  </p>
                ) : null}
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/40">
              Zatím žádný naplánovaný zápas
            </div>
          )}
          {matches.length > 1 && (
            <Link
              href="/dashboard/matches"
              className="mt-2 block text-center text-xs text-red-400 hover:text-red-300"
            >
              Všechny zápasy →
            </Link>
          )}
        </section>

        {/* Rodič: rychlé statistiky dítěte + graf (4.1) */}
        {!isStaff && child && (
          <>
            <section>
              <div className="mb-2 flex items-center justify-between px-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {child.firstName} {child.lastName}
                  {child.category ? ` · ${child.category}` : ""}
                </h2>
                <Link
                  href={`/dashboard/player/${child.id}`}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Profil →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <QuickStat label="Zápasy" value={child.stats.games} />
                <QuickStat label="Hity" value={child.stats.hits} accent />
                <QuickStat label="Doběhy" value={child.stats.runs} />
                <QuickStat label="HR" value={child.stats.homeRuns} accent />
              </div>
              <p className="mt-2 text-center text-xs text-white/35">
                AVG {formatAvg(child.stats.avg)}
                {child.team ? ` · ${child.team.name}` : ""}
              </p>
            </section>

            <ChildTrend playerId={child.id} />

            {players.length > 1 && (
              <section className="space-y-2">
                <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  Další děti
                </h2>
                {players.slice(1).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/player/${p.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                  >
                    <span className="font-medium">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-xs text-white/40">
                      {p.stats.hits} H · {formatAvg(p.stats.avg)} AVG
                    </span>
                  </Link>
                ))}
              </section>
            )}
          </>
        )}

        {!isStaff && !child && (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
            Zatím není přiřazené dítě.
            <br />
            <span className="text-white/30">Po schválení registrace se zobrazí zde.</span>
          </div>
        )}

        {/* Staff: zkratky, bez seznamu hráčů */}
        {isStaff && (
          <section className="space-y-2">
            <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Rychlé akce
            </h2>
            <Link
              href="/dashboard/score"
              className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-600/10 p-4"
            >
              <span className="text-xl">✎</span>
              <div>
                <p className="font-semibold text-red-300">Zapsat zápas</p>
                <p className="text-xs text-white/45">Živý scoring na mobilu</p>
              </div>
            </Link>
            <Link
              href="/dashboard/matches"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <span className="text-xl">📅</span>
              <div>
                <p className="font-semibold">Kalendář zápasů</p>
                <p className="text-xs text-white/45">Program a výsledky</p>
              </div>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="text-xl">⚙</span>
                <div>
                  <p className="font-semibold">Admin panel</p>
                  <p className="text-xs text-white/45">Uživatelé, týmy, sezóny</p>
                </div>
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function QuickStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center">
      <p className={`text-xl font-bold tabular-nums ${accent ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    LIVE: "bg-red-500/20 text-red-300",
    SCHEDULED: "bg-sky-500/20 text-sky-300",
    FINISHED: "bg-white/10 text-white/50",
  };
  const label: Record<string, string> = {
    LIVE: "ŽIVĚ",
    SCHEDULED: "Plán",
    FINISHED: "Konec",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[status] || map.SCHEDULED}`}>
      {label[status] || status}
    </span>
  );
}

function formatMatchDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function ChildTrend({ playerId }: { playerId: string }) {
  const [points, setPoints] = useState<{ label: string; hits: number; atBats: number }[]>([]);

  useEffect(() => {
    fetch(`/api/players/${playerId}`)
      .then((r) => r.json())
      .then((d) => {
        const recent = (d.recentGames || []) as {
          opponent: string;
          hits: number;
          atBats: number;
        }[];
        setPoints(
          recent.map((g) => ({
            label: g.opponent.slice(0, 5),
            hits: g.hits,
            atBats: g.atBats,
          }))
        );
      })
      .catch(() => setPoints([]));
  }, [playerId]);

  if (!points.length) return null;
  return <TrendChart points={points} title="Výkon v posledních zápasech" />;
}
