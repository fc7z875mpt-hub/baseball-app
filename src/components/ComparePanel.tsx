"use client";

import { useMemo, useState } from "react";
import { formatAvg } from "@/lib/stats";
import { TrendChart, type TrendPoint } from "@/components/TrendChart";

type Scope = "team" | "allstar" | "other";
type Metric = "hits" | "runs" | "homeRuns" | "avg";

type TeamOpt = { id: string; name: string; shortName: string | null };

type Agg = {
  hits: number;
  runs: number;
  homeRuns: number;
  games: number;
  avg: number | null;
};

type ComparePayload = {
  scope: string;
  scopeLabel?: string;
  me: Agg;
  average?: Agg & { avg: number };
  teamAverage: Agg & { avg: number };
  best: (Agg & { name: string }) | null;
  peerCount: number;
  teams?: TeamOpt[];
};

type GameRow = {
  hits: number;
  atBats: number;
  runs: number;
  homeRuns: number;
};

const METRICS: { id: Metric; label: string }[] = [
  { id: "hits", label: "Hity" },
  { id: "runs", label: "Doběhy" },
  { id: "homeRuns", label: "HR" },
  { id: "avg", label: "AVG" },
];

const SCOPES: { id: Scope; label: string }[] = [
  { id: "team", label: "Tým" },
  { id: "allstar", label: "All-star" },
  { id: "other", label: "Jiný tým" },
];

function metricValue(a: Agg, m: Metric): number {
  if (m === "hits") return a.hits;
  if (m === "runs") return a.runs;
  if (m === "homeRuns") return a.homeRuns;
  return a.avg != null ? Math.round(a.avg * 1000) / 1000 : 0;
}

function metricLabel(m: Metric): string {
  return METRICS.find((x) => x.id === m)?.label || m;
}

function formatMetric(m: Metric, v: number): string {
  if (m === "avg") return formatAvg(v === 0 ? null : v);
  return String(Math.round(v * 10) / 10);
}

/** Hodnota za 1 zápas z agregace (pro vodorovnou referenční čáru) */
function perGame(a: Agg, m: Metric): number {
  if (m === "avg") return a.avg != null ? a.avg * 100 : 0; // % pro graf
  if (!a.games) return 0;
  if (m === "hits") return a.hits / a.games;
  if (m === "runs") return a.runs / a.games;
  return a.homeRuns / a.games;
}

export function ComparePanel({
  playerId,
  recentGames,
}: {
  playerId: string;
  recentGames: GameRow[];
}) {
  const [metric, setMetric] = useState<Metric>("hits");
  const [scope, setScope] = useState<Scope | null>(null);
  const [otherTeamId, setOtherTeamId] = useState("");
  const [data, setData] = useState<ComparePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(next: Scope, teamId?: string) {
    setScope(next);
    setErr("");
    const tid = teamId ?? otherTeamId;

    setLoading(true);
    try {
      const q = new URLSearchParams({ scope: next });
      if (next === "other" && tid) q.set("teamId", tid);
      const res = await fetch(`/api/players/${playerId}/compare?${q}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Chyba");
      setData(d);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  const avg = data?.average ?? data?.teamAverage;

  // Body grafu – vždy jedna statistika
  const chartPoints: TrendPoint[] = useMemo(() => {
    return recentGames.map((g, i) => {
      if (metric === "avg") {
        const pct = g.atBats > 0 ? (g.hits / g.atBats) * 100 : 0;
        return { label: `Z${i + 1}`, hits: pct, atBats: 100 };
      }
      if (metric === "hits") return { label: `Z${i + 1}`, hits: g.hits, atBats: 1 };
      if (metric === "runs") return { label: `Z${i + 1}`, hits: g.runs, atBats: 1 };
      return { label: `Z${i + 1}`, hits: g.homeRuns, atBats: 1 };
    });
  }, [recentGames, metric]);

  // Referenční křivky (průměr / nejlepší) – vodorovné podle sezónního průměru na zápas
  const compareSeries = useMemo(() => {
    if (!scope || !data || !avg || (scope === "other" && !otherTeamId)) return undefined;
    const n = chartPoints.length || 1;

    const avgLine = perGame(avg, metric);
    const bestLine = data.best ? perGame(data.best, metric) : avgLine;

    // Pro AVG už je v grafech 0–100 (%), perGame vrací *100
    // Pro hity/doběhy/HR škálujeme do 0–100 pro TrendChart (maxY=100)
    // TrendChart: value = hits/atBats*100 when atBats>0, else hits*20
    // Our points use atBats=1 and hits=raw count → value = hits*20. That's wrong for counts.
    // Fix: use scale so chart shows raw-ish values. TrendChart multiplies hits*20 if atBats is 0-ish.
    // Looking at TrendChart: `p.atBats > 0 ? (p.hits/p.atBats)*100 : p.hits * 20`
    // For counts we set atBats=1, hits=count → value = count*100. Too high.
    // Better to change points to encode value as percentage of a sensible max.

    return [
      {
        label: `Průměr (${metricLabel(metric)})`,
        color: "#94a3b8",
        values: Array(n).fill(
          metric === "avg" ? avgLine : Math.min(100, avgLine * (metric === "homeRuns" ? 40 : 15))
        ) as number[],
      },
      {
        label: data.best
          ? `Nejlepší · ${data.best.name.split(" ")[0]}`
          : "Nejlepší",
        color: "#fbbf24",
        values: Array(n).fill(
          metric === "avg" ? bestLine : Math.min(100, bestLine * (metric === "homeRuns" ? 40 : 15))
        ) as number[],
      },
    ];
  }, [scope, data, avg, otherTeamId, metric, chartPoints.length]);

  // Upravit body tak, aby TrendChart zobrazil rozumné hodnoty pro hity/R/HR
  const scaledPoints: TrendPoint[] = useMemo(() => {
    if (metric === "avg") return chartPoints;
    // hits/atBats*100 → chceme zobrazit počet: nastavíme hits=count, atBats tak, aby count/atBats*100 = count*scale
    // Jednoduše: atBats=100/scale, hits=count → value = count * scale
    // scale 15 pro hits/runs, 40 pro HR → 2 hity = 30 na ose 0–100
    return chartPoints.map((p) => ({
      ...p,
      atBats: metric === "homeRuns" ? 2.5 : 100 / 15,
    }));
  }, [chartPoints, metric]);

  const chartTitle =
    scope && data
      ? `Výkon · ${metricLabel(metric)} · ${data.scopeLabel || ""}`
      : `Výkon v posledních zápasech · ${metricLabel(metric)}`;

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        Výkon v posledních zápasech
      </h2>

      {/* 1) Výběr statistiky – vždy jen jedna */}
      <div>
        <p className="mb-1.5 px-0.5 text-[10px] text-white/35">Co porovnáváš</p>
        <div className="flex flex-wrap gap-1.5">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                metric === m.id ? "bg-sky-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2) S kým */}
      <div>
        <p className="mb-1.5 px-0.5 text-[10px] text-white/35">S kým porovnáváš</p>
        <div className="flex flex-wrap gap-1.5">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => load(s.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                scope === s.id ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {scope === "other" && data?.teams && (
        <select
          value={otherTeamId}
          onChange={(e) => {
            const v = e.target.value;
            setOtherTeamId(v);
            if (v) load("other", v);
          }}
          className="w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">— vyber tým —</option>
          {data.teams.map((tm) => (
            <option key={tm.id} value={tm.id}>
              {tm.name}
              {tm.shortName ? ` (${tm.shortName})` : ""}
            </option>
          ))}
        </select>
      )}

      {loading && <p className="text-center text-sm text-white/40">Načítám…</p>}
      {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}

      {/* Graf – ty + volitelně průměr a nejlepší */}
      {scaledPoints.length > 0 && (
        <TrendChart
          points={scaledPoints}
          title={chartTitle}
          series={compareSeries}
        />
      )}

      {/* Souhrn jen pro vybranou statistiku */}
      {scope && data && !loading && !(scope === "other" && !otherTeamId) && avg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-white/60">
          <p className="mb-3 font-medium text-white/80">
            {metricLabel(metric)}
            {" · "}
            {data.scopeLabel}
            {data.peerCount > 0 ? ` · ${data.peerCount} hráčů` : " · málo dat"}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-sky-400">Ty (sezóna)</p>
              <p className="text-lg font-bold text-sky-300">
                {formatMetric(metric, metricValue(data.me, metric))}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-white/50">Průměr</p>
              <p className="text-lg font-bold text-white/70">
                {formatMetric(metric, metricValue(avg, metric))}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-amber-400">Nejlepší</p>
              <p className="text-lg font-bold text-amber-300">
                {data.best ? formatMetric(metric, metricValue(data.best, metric)) : "—"}
              </p>
              <p className="truncate text-[10px] text-white/35">{data.best?.name || ""}</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-white/30">
            V grafu: ty (červená) · průměr (šedá) · nejlepší (zlatá) — vždy jen {metricLabel(metric)}.
          </p>
        </div>
      )}
    </section>
  );
}
