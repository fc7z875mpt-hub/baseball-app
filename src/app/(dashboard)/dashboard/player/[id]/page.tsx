"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendChart } from "@/components/TrendChart";
import { IconBat, IconRunner, IconHomeRun } from "@/components/Icons";
import { formatAvg, type AggregatedStats } from "@/lib/stats";
import { ComparePanel } from "@/components/ComparePanel";

type PlayerDetail = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
  photoUrl: string | null;
  birthYear: number | null;
  category: string | null;
  teams: {
    team: {
      id: string;
      name: string;
      shortName: string | null;
      primaryColor: string;
      logoUrl?: string | null;
    };
    season: { name: string; year: number } | null;
  }[];
};

type RecentGame = {
  matchId: string;
  date: string;
  opponent: string;
  hits: number;
  atBats: number;
  runs: number;
  homeRuns: number;
  errors: number;
  result: string;
};

type Sibling = { id: string; firstName: string; lastName: string };

export default function PlayerProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [recent, setRecent] = useState<RecentGame[]>([]);
  const [canCompare, setCanCompare] = useState(false);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    setLoading(true);
    setExpanded(false);

    Promise.all([
      fetch(`/api/players/${id}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Chyba");
        return d;
      }),
      fetch("/api/players/me")
        .then((r) => r.json())
        .then((d) => d.players || [])
        .catch(() => []),
    ])
      .then(([d, kids]) => {
        setPlayer(d.player);
        setStats(d.stats);
        setRecent(d.recentGames || []);
        setCanCompare(!!d.canCompare);
        setSiblings(
          (kids as Sibling[]).map((k) => ({
            id: k.id,
            firstName: k.firstName,
            lastName: k.lastName,
          }))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, id]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white/60">Načítám profil…</main>
    );
  }

  if (error || !player || !stats) {
    return (
      <main className="px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Link href="/dashboard" className="text-sm text-sky-400">← Domů</Link>
          <p className="mt-6 text-white/60">{error || "Hráč nenalezen"}</p>
        </div>
      </main>
    );
  }

  const team = player.teams[0]?.team;
  const season = player.teams[0]?.season;
  const color = team?.primaryColor || "#1e3a5f";

  const trendPoints = recent.map((g, i) => ({
    label: `Z${i + 1}`,
    hits: g.hits,
    atBats: g.atBats,
  }));

  return (
    <main className="px-4 pt-5 pb-4">
      <div className="mx-auto max-w-lg space-y-5">
        {siblings.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/player/${s.id}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  s.id === id ? "bg-sky-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {s.firstName}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center pt-2 text-center">
          {player.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photoUrl}
              alt=""
              className="h-28 w-28 rounded-full object-cover ring-4 ring-white/10 shadow-xl"
            />
          ) : (
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full text-3xl font-black text-white ring-4 ring-white/10 shadow-xl"
              style={{ backgroundColor: color }}
            >
              {player.firstName[0]}
              {player.lastName[0]}
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {player.firstName} {player.lastName}
          </h1>
          {player.jerseyNumber != null && (
            <p className="mt-1 text-lg font-semibold text-sky-400">#{player.jerseyNumber}</p>
          )}
          <p className="mt-1 text-sm text-white/55">
            {[team?.name, player.category || (player.birthYear ? String(player.birthYear) : null)]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {season && <p className="mt-0.5 text-xs text-white/35">{season.name}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <BigStat label="Hity" value={stats.hits} color="sky" icon={<IconBat size={22} />} />
          <BigStat label="Doběhy" value={stats.runs} color="emerald" icon={<IconRunner size={22} />} />
          <BigStat label="HR" value={stats.homeRuns} color="red" icon={<IconHomeRun size={22} />} />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/5 px-4 py-3 text-center text-sm text-sky-300/90 transition hover:bg-sky-500/10"
        >
          {expanded ? "Skrýt detailní statistiky ▲" : "Klepni pro kompletní statistiky ▼"}
        </button>

        {expanded && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <MiniStat label="Zápasy" value={stats.games} />
              <MiniStat label="AVG" value={formatAvg(stats.avg)} accent />
              <MiniStat label="RBI" value={stats.rbi} />
              <MiniStat label="BB" value={stats.walks} />
              <MiniStat label="SO" value={stats.strikeouts} />
              <MiniStat label="OBP" value={formatAvg(stats.obp)} />
              <MiniStat label="SLG" value={formatAvg(stats.slg)} />
              <MiniStat label="OPS" value={formatAvg(stats.ops)} accent />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Chyby" value={stats.errors} />
              <MiniStat label="Putout" value={stats.putouts} />
              <MiniStat label="Asistence" value={stats.assists} />
            </div>
          </div>
        )}

        {canCompare && stats.games > 0 ? (
          <ComparePanel
            playerId={id}
            recentGames={recent.map((g) => ({
              hits: g.hits,
              atBats: g.atBats,
              runs: g.runs,
              homeRuns: g.homeRuns,
            }))}
          />
        ) : (
          trendPoints.length > 0 && (
            <TrendChart points={trendPoints} title="Výkon v posledních zápasech" />
          )
        )}

        {recent.length > 0 && (
          <div>
            <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Poslední zápasy
            </h2>
            <div className="space-y-2">
              {[...recent].reverse().map((g) => {
                const dateLabel = new Date(g.date).toLocaleDateString("cs-CZ", {
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div
                    key={g.matchId}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/50 ring-1 ring-white/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">vs {g.opponent}</p>
                      <p className="text-xs text-white/40">
                        {dateLabel} · {g.result}
                      </p>
                    </div>
                    <div className="text-right text-sm tabular-nums">
                      <p className="font-semibold text-sky-300">
                        {g.hits}/{g.atBats}
                      </p>
                      <p className="text-xs text-white/40">
                        {[`${g.runs} R`, g.homeRuns > 0 ? `${g.homeRuns} HR` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.games === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
            Zatím žádné statistiky ze zápasů.
          </div>
        )}
      </div>
    </main>
  );
}

function BigStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "sky" | "emerald" | "red";
}) {
  const map = {
    sky: "border-sky-500/25 bg-sky-500/10 text-sky-400",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    red: "border-red-500/25 bg-red-500/10 text-red-400",
  };
  return (
    <div className={`rounded-2xl border px-3 py-4 text-center ${map[color]}`}>
      <div className="mb-1.5 flex justify-center">{icon}</div>
      <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium opacity-80">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2.5 text-center">
      <p className={`text-base font-bold tabular-nums ${accent ? "text-sky-400" : "text-white"}`}>{value}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </div>
  );
}
