"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendChart } from "@/components/TrendChart";

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
    logoUrl?: string | null;
  } | null;
  stats: {
    games: number;
    hits: number;
    runs: number;
    homeRuns: number;
    avg: number | null;
  };
};

type TeamInfo = {
  id?: string;
  name: string;
  shortName: string | null;
  primaryColor: string;
  logoUrl?: string | null;
};

type UpcomingMatch = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: TeamInfo;
  awayTeam?: TeamInfo | null;
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
      <main className="flex min-h-screen items-center justify-center text-white/50">
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
  const team = child?.team;

  // Staff home – quick actions
  if (isStaff) {
    return (
      <main className="px-4 pt-6">
        <div className="mx-auto max-w-lg space-y-5">
          <header>
            <p className="text-sm text-white/45">Ahoj,</p>
            <h1 className="text-2xl font-bold">
              {user?.firstName || user?.name || "Admin"} 👋
            </h1>
          </header>

          {nextMatch && <MatchCard match={nextMatch} />}

          <section className="space-y-2">
            <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Rychlé akce
            </h2>
            <Link
              href="/dashboard/score"
              className="flex items-center gap-3 rounded-2xl border border-sky-500/25 bg-sky-600/10 p-4"
            >
              <span className="text-xl">✎</span>
              <div>
                <p className="font-semibold text-sky-300">Zapsat zápas</p>
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
        </div>
      </main>
    );
  }

  // ─── Parent home (mockup) ───
  return (
    <main className="px-4 pt-5">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Top bar: team logo + name + bell */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamBadge
              name={team?.name || "Tým"}
              color={team?.primaryColor || "#1e40af"}
              logoUrl={team?.logoUrl}
              size={44}
            />
            <div>
              <p className="text-sm font-bold leading-tight">
                {team?.shortName || team?.name || "Můj tým"}
              </p>
              {team?.name && team?.shortName && (
                <p className="text-[11px] uppercase tracking-wide text-white/40">
                  {team.name.replace(team.shortName, "").trim() || ""}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 hover:bg-white/5"
            aria-label="Oznámení"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
        </header>

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ahoj, {user?.firstName || user?.name || "rodiči"} 👋
          </h1>
          {child && (
            <p className="mt-0.5 text-sm text-white/45">
              {child.firstName} {child.lastName}
              {child.category ? ` · ${child.category}` : ""}
            </p>
          )}
        </div>

        {/* Příští zápas */}
        <section>
          {nextMatch ? (
            <MatchCard match={nextMatch} />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/40">
              Zatím žádný naplánovaný zápas
            </div>
          )}
        </section>

        {/* Statistiky sezóny */}
        {child && (
          <section>
            <h2 className="mb-2.5 flex items-center gap-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="m7 14 4-4 3 3 5-6" />
              </svg>
              Statistiky sezóny
            </h2>
            <div className="grid grid-cols-4 gap-2">
              <StatTile
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m14 4 6 6-8 8-6-6Z" />
                    <path d="m4 14 6 6" />
                  </svg>
                }
                label="Hity"
                value={child.stats.hits}
              />
              <StatTile
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v5l3 3" />
                    <path d="m9 15 3 6 3-6" />
                  </svg>
                }
                label="Doběhy"
                value={child.stats.runs}
              />
              <StatTile
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3c2 3 2 6 0 9s-2 6 0 9" />
                    <path d="M3 12h18" />
                  </svg>
                }
                label="HR"
                value={child.stats.homeRuns}
              />
              <StatTile
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                }
                label="Zápasy"
                value={child.stats.games}
              />
            </div>
          </section>
        )}

        {/* Graf výkonu */}
        {child && <ChildTrend playerId={child.id} />}

        {!child && (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
            Zatím není přiřazené dítě.
            <br />
            <span className="text-white/30">Po schválení registrace se zobrazí zde.</span>
          </div>
        )}

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
                  {p.stats.hits} H · {p.stats.games} G
                </span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function TeamBadge({
  name,
  color,
  logoUrl,
  size = 40,
}: {
  name: string;
  color: string;
  logoUrl?: string | null;
  size?: number;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-white/10"
      style={{ width: size, height: size, backgroundColor: color || "#1e40af" }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function MatchCard({ match }: { match: UpcomingMatch }) {
  const awayName =
    match.awayTeam?.shortName ||
    match.awayTeam?.name ||
    match.opponent;
  const homeName = match.homeTeam.shortName || match.homeTeam.name;
  const showScore =
    match.status === "LIVE" || match.status === "FINISHED";

  return (
    <Link
      href="/dashboard/matches"
      className="block overflow-hidden rounded-2xl border border-white/10 bg-[#0d1b2e]"
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Příští zápas
          </span>
          <StatusPill status={match.status} />
        </div>

        <p className="mb-4 text-base font-bold">
          {formatMatchDate(match.date)}
          {match.time ? ` ${match.time}` : ""}
          <span className="font-normal text-white/40"> · vs. {match.opponent}</span>
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <TeamBadge
              name={homeName}
              color={match.homeTeam.primaryColor}
              logoUrl={match.homeTeam.logoUrl}
              size={52}
            />
            <p className="text-lg font-bold tabular-nums">
              {showScore ? match.homeScore : "–"}
            </p>
            <p className="max-w-[90px] truncate text-center text-[11px] text-white/50">
              {homeName}
            </p>
          </div>

          <span className="text-sm font-bold text-white/30">VS</span>

          <div className="flex flex-1 flex-col items-center gap-1.5">
            <TeamBadge
              name={awayName}
              color={match.awayTeam?.primaryColor || "#7f1d1d"}
              logoUrl={match.awayTeam?.logoUrl}
              size={52}
            />
            <p className="text-lg font-bold tabular-nums">
              {showScore ? match.awayScore : "–"}
            </p>
            <p className="max-w-[90px] truncate text-center text-[11px] text-white/50">
              {awayName}
            </p>
          </div>
        </div>

        {match.location && (
          <div className="mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3 text-xs text-white/40">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {match.location}
            <span className="ml-auto text-white/25">›</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] px-2 py-3 text-center">
      <div className="mb-1 flex justify-center text-sky-400/80">{icon}</div>
      <p className="text-xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[10px] text-white/40">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "LIVE") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        Živě
      </span>
    );
  }
  if (status === "FINISHED") {
    return (
      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/50">
        Ukončený
      </span>
    );
  }
  return (
    <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-400">
      Plánovaný
    </span>
  );
}

function formatMatchDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("cs-CZ", { weekday: "long" });
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function ChildTrend({ playerId }: { playerId: string }) {
  const [points, setPoints] = useState<
    { label: string; hits: number; atBats: number }[]
  >([]);

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
          recent.map((g, i) => ({
            label: `Z${i + 1}`,
            hits: g.hits,
            atBats: g.atBats,
          }))
        );
      })
      .catch(() => setPoints([]));
  }, [playerId]);

  if (!points.length) return null;
  return <TrendChart points={points} />;
}
