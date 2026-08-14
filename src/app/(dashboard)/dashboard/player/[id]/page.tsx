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

type CompareData = {
  scope: string;
  me: { hits: number; runs: number; homeRuns: number; games: number; avg: number | null };
  teamAverage: { hits: number; runs: number; homeRuns: number; games: number; avg: number };
  best: {
    name: string;
    hits: number;
    runs: number;
    homeRuns: number;
    games: number;
    avg: number | null;
  } | null;
  peerCount: number;
};

export default function PlayerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [recent, setRecent] = useState<RecentGame[]>([]);
  const [canCompare, setCanCompare] = useState(false);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [compare, setCompare] = useState<CompareData | null>(null);
  const [compareScope, setCompareScope] = useState<"team" | "category">("team");
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;
    setLoading(true);
    setShowCompare(false);
    setCompare(null);

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

  async function loadCompare(scope: "team" | "category") {
    setCompareScope(scope);
    const res = await fetch(`/api/players/${id}/compare?scope=${scope}`);
    const d = await res.json();
    if (res.ok) {
      setCompare(d);
      setShowCompare(true);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white/60">
        Načítám profil…
      </main>
    );
  }

  if (error || !player || !stats) {
    return (
      <main className="px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Link href="/dashboard" className="text-sm text-sky-400">
            ← Domů
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

  const trendPoints = recent.map((g, i) => ({
    label: `Z${i + 1}`,
    hits: g.hits,
    atBats: g.atBats,
  }));

  return (
    <main className="px-4 pt-5">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Přepínač dětí */}
        {siblings.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/player/${s.id}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  s.id === id
                    ? "bg-sky-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {s.firstName}
              </Link>
            ))}
          </div>
        )}

        {/* Hlavička hráče */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-5">
          <div className="flex items-center gap-4">
            {player.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.photoUrl}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/10"
              />
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
                style={{ backgroundColor: color }}
              >
                {player.jerseyNumber != null
                  ? `#${player.jerseyNumber}`
                  : `${player.firstName[0]}${player.lastName[0]}`}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {player.firstName} {player.lastName}
              </h1>
              <p className="text-sm text-white/55">
                {[team?.name, player.category, player.birthYear]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {season && (
                <p className="mt-0.5 text-xs text-white/35">{season.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Základní karty – klik = vysvětlení */}
        <div>
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Útok · klepni na kartu pro vysvětlení
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <StatCard label="Hity" value={stats.hits} accent="blue" />
            <StatCard label="Doběhy" value={stats.runs} />
            <StatCard label="HR" value={stats.homeRuns} accent="red" />
            <StatCard label="Zápasy" value={stats.games} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <StatCard label="AVG" value={formatAvg(stats.avg)} accent="red" />
          <StatCard label="RBI" value={stats.rbi} />
          <StatCard label="BB" value={stats.walks} />
          <StatCard label="SO" value={stats.strikeouts} />
        </div>

        {stats.games > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="OBP" value={formatAvg(stats.obp)} />
            <StatCard label="SLG" value={formatAvg(stats.slg)} />
            <StatCard label="OPS" value={formatAvg(stats.ops)} accent="green" />
          </div>
        )}

        <div>
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Práce v poli
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Chyby" value={stats.errors} />
            <StatCard label="Putout" value={stats.putouts} />
            <StatCard label="Asistence" value={stats.assists} />
          </div>
        </div>

        {stats.hits > 0 && <BarChart items={hitBreakdown} title="Složení hitů" />}

        {trendPoints.length > 0 && <TrendChart points={trendPoints} />}

        {/* Porovnat – jen s oprávněním */}
        {canCompare && stats.games > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Porovnat
              </h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => loadCompare("team")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    showCompare && compareScope === "team"
                      ? "bg-sky-600 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  Tým
                </button>
                <button
                  type="button"
                  onClick={() => loadCompare("category")}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    showCompare && compareScope === "category"
                      ? "bg-sky-600 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  Kategorie
                </button>
              </div>
            </div>

            {showCompare && compare && (
              <div className="space-y-2 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                <p className="text-xs text-white/45">
                  {compareScope === "team" ? "V rámci týmu" : "V kategorii"}
                  {compare.peerCount > 0
                    ? ` · ${compare.peerCount} spoluhráčů`
                    : " · zatím málo dat"}
                </p>
                <CompareRow
                  label="Hity"
                  me={compare.me.hits}
                  avg={compare.teamAverage.hits}
                  best={compare.best?.hits}
                  bestName={compare.best?.name}
                />
                <CompareRow
                  label="Doběhy"
                  me={compare.me.runs}
                  avg={compare.teamAverage.runs}
                  best={compare.best?.runs}
                  bestName={compare.best?.name}
                />
                <CompareRow
                  label="HR"
                  me={compare.me.homeRuns}
                  avg={compare.teamAverage.homeRuns}
                  best={compare.best?.homeRuns}
                  bestName={compare.best?.name}
                />
                <div className="flex gap-3 pt-1 text-[10px] text-white/40">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-sky-400" /> Ty
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-white/40" /> Průměr
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Nejlepší
                  </span>
                </div>
              </div>
            )}

            {!showCompare && (
              <button
                type="button"
                onClick={() => loadCompare("team")}
                className="w-full rounded-2xl border border-purple-500/25 bg-purple-500/10 py-3 text-sm font-semibold text-purple-200 hover:bg-purple-500/15"
              >
                Porovnat výkon →
              </button>
            )}
          </section>
        )}

        {/* Poslední zápasy */}
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
                const detail = [
                  `${g.runs} R`,
                  g.homeRuns > 0 ? `${g.homeRuns} HR` : null,
                  g.errors > 0 ? `${g.errors} E` : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    key={g.matchId}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1b2e] px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">vs {g.opponent}</p>
                      <p className="text-xs text-white/40">
                        {dateLabel} · {g.result}
                      </p>
                    </div>
                    <div className="text-right text-sm tabular-nums">
                      <p className="font-semibold">
                        {g.hits}/{g.atBats}
                      </p>
                      <p className="text-xs text-white/40">{detail}</p>
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

function CompareRow({
  label,
  me,
  avg,
  best,
  bestName,
}: {
  label: string;
  me: number;
  avg: number;
  best?: number;
  bestName?: string;
}) {
  const max = Math.max(me, avg, best ?? 0, 1);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="tabular-nums text-white/80">
          <span className="text-sky-400">{me}</span>
          <span className="text-white/30"> / </span>
          <span className="text-white/50">{avg}</span>
          {best != null && (
            <>
              <span className="text-white/30"> / </span>
              <span className="text-amber-400" title={bestName}>
                {best}
              </span>
            </>
          )}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white/20"
          style={{ width: `${(avg / max) * 100}%` }}
        />
        {best != null && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-amber-400/40"
            style={{ width: `${(best / max) * 100}%` }}
          />
        )}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-sky-400"
          style={{ width: `${(me / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
