"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { BarChart } from "@/components/BarChart";
import { TrendChart } from "@/components/TrendChart";
import { formatAvg, type AggregatedStats } from "@/lib/stats";

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

export default function PlayerProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [recent, setRecent] = useState<RecentGame[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    setLoading(true);
    fetch(`/api/players/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Chyba");
        setPlayer(d.player);
        setStats(d.stats);
        setRecent(d.recentGames || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, id]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">
        Načítám profil…
      </main>
    );
  }

  if (error || !player || !stats) {
    return (
      <main className="min-h-screen bg-[#0a1628] px-4 py-8 text-white">
        <div className="mx-auto max-w-lg">
          <Link href="/dashboard" className="text-sm text-red-400 hover:text-red-300">
            ← Zpět
          </Link>
          <p className="mt-6 text-white/60">{error || "Hráč nenalezen"}</p>
        </div>
      </main>
    );
  }

  const team = player.teams[0]?.team;
  const season = player.teams[0]?.season;
  const color = team?.primaryColor || "#1e3a5f";

  const hitBreakdown = [
    { label: "1B", value: stats.singles, color: "#7dd3fc" },
    { label: "2B", value: stats.doubles, color: "#38bdf8" },
    { label: "3B", value: stats.triples, color: "#0ea5e9" },
    { label: "HR", value: stats.homeRuns, color: "#e11d2e" },
  ];

  const trendPoints = recent.map((g) => ({
    label: g.opponent.slice(0, 6),
    hits: g.hits,
    atBats: g.atBats,
  }));

  return (
    <main className="min-h-screen bg-[#0a1628] px-4 py-6 pb-16 text-white">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-white/50 hover:text-white"
          >
            ← Dashboard
          </Link>
          {season && (
            <span className="text-xs text-white/40">{season.name}</span>
          )}
        </div>

        {/* Profilová hlavička */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {player.jerseyNumber != null
                ? `#${player.jerseyNumber}`
                : `${player.firstName[0]}${player.lastName[0]}`}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {player.firstName} {player.lastName}
              </h1>
              <p className="text-sm text-white/55">
                {[team?.name, player.category, player.birthYear]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {player.teams.length > 1 && (
                <p className="mt-1 text-xs text-white/35">
                  Také:{" "}
                  {player.teams
                    .slice(1)
                    .map((t) => t.team.shortName || t.team.name)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Klíčové statistiky */}
        <div>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            Sezóna – útok
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            <StatCard label="Zápasy" value={stats.games} />
            <StatCard label="AVG" value={formatAvg(stats.avg)} accent="red" />
            <StatCard label="Hity" value={stats.hits} accent="blue" />
            <StatCard label="HR" value={stats.homeRuns} accent="red" />
            <StatCard label="Doběhy" value={stats.runs} />
            <StatCard label="RBI" value={stats.rbi} />
            <StatCard label="BB" value={stats.walks} />
            <StatCard label="SO" value={stats.strikeouts} />
          </div>
        </div>

        {stats.games > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="OBP" value={formatAvg(stats.obp)} />
            <StatCard label="SLG" value={formatAvg(stats.slg)} />
            <StatCard label="OPS" value={formatAvg(stats.ops)} accent="green" />
          </div>
        )}

        {/* Pole */}
        <div>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            Práce v poli
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Chyby" value={stats.errors} />
            <StatCard label="Putout" value={stats.putouts} />
            <StatCard label="Asistence" value={stats.assists} />
          </div>
        </div>

        {/* Grafy */}
        {stats.hits > 0 && (
          <BarChart items={hitBreakdown} title="Složení hitů" />
        )}

        {trendPoints.length > 0 && (
          <TrendChart points={trendPoints} title="Hity po zápasech" />
        )}

        {/* Poslední zápasy */}
        {recent.length > 0 && (
          <div>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
              Poslední zápasy
            </h2>
            <div className="space-y-2">
              {[...recent].reverse().map((g) => (
                <div
                  key={g.matchId}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">vs {g.opponent}</p>
                    <p className="text-xs text-white/40">
                      {new Date(g.date).toLocaleDateString("cs-CZ", {
                        day: "numeric",
                        month: "short",
                      }){" "}
                      · {g.result}
                    </p>
                  </div>
                  <div className="text-right text-sm tabular-nums">
                    <p className="font-semibold">
                      {g.hits}/{g.atBats}
                    </p>
                    <p className="text-xs text-white/40">
                      {g.runs} R{g.homeRuns > 0 ? ` · ${g.homeRuns} HR` : ""}
                      {g.errors > 0 ? ` · ${g.errors} E` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.games === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">
            Zatím žádné statistiky ze zápasů.
            <br />
            <span className="text-white/30">
              Admin může načíst demo data v admin panelu.
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
