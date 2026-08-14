"use client";

import { useState } from "react";
import { formatAvg } from "@/lib/stats";

type Scope = "team" | "allstar" | "other";

type TeamOpt = { id: string; name: string; shortName: string | null };

type ComparePayload = {
  scope: string;
  scopeLabel?: string;
  me: { hits: number; runs: number; homeRuns: number; games: number; avg: number | null };
  average?: { hits: number; runs: number; homeRuns: number; games: number; avg: number };
  teamAverage: { hits: number; runs: number; homeRuns: number; games: number; avg: number };
  best: { name: string; hits: number; runs: number; homeRuns: number; games: number; avg: number | null } | null;
  peerCount: number;
  teams?: TeamOpt[];
  compareTeamName?: string | null;
  needsTeamId?: boolean;
};

export function ComparePanel({ playerId }: { playerId: string }) {
  const [scope, setScope] = useState<Scope | null>(null);
  const [otherTeamId, setOtherTeamId] = useState("");
  const [data, setData] = useState<ComparePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(next: Scope, teamId?: string) {
    setScope(next);
    setErr("");
    const tid = teamId ?? otherTeamId;
    if (next === "other" && !tid) {
      // načti seznam týmů
      setLoading(true);
      try {
        const res = await fetch(`/api/players/${playerId}/compare?scope=other`);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Chyba");
        setData(d);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Chyba");
      } finally {
        setLoading(false);
      }
      return;
    }

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

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
        Porovnání výkonu
      </h2>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { id: "team" as const, label: "Tým" },
            { id: "allstar" as const, label: "All-star" },
            { id: "other" as const, label: "Jiný tým" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => load(opt.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              scope === opt.id ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/15"
            }`}
          >
            {opt.label}
          </button>
        ))}
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
          <option value="">— vyber tým k porovnání —</option>
          {data.teams.map((tm) => (
            <option key={tm.id} value={tm.id}>
              {tm.name}
              {tm.shortName ? ` (${tm.shortName})` : ""}
            </option>
          ))}
        </select>
      )}

      {loading && <p className="text-center text-sm text-white/40">Načítám porovnání…</p>}
      {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}

      {scope && data && !loading && !(scope === "other" && !otherTeamId) && avg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-white/60">
          <p className="mb-3 font-medium text-white/80">
            {data.scopeLabel || "Porovnání"}
            {data.peerCount > 0 ? ` · ${data.peerCount} hráčů` : " · málo dat"}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-sky-400">Ty</p>
              <p className="text-lg font-bold text-sky-300">{formatAvg(data.me.avg)}</p>
              <p className="text-[10px] text-white/35">
                {data.me.hits} H · {data.me.runs} R
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-white/50">Průměr</p>
              <p className="text-lg font-bold text-white/70">{formatAvg(avg.avg)}</p>
              <p className="text-[10px] text-white/35">
                {avg.hits} H · {avg.runs} R
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-2 py-2.5">
              <p className="text-[10px] text-amber-400">Nejlepší</p>
              <p className="text-lg font-bold text-amber-300">{formatAvg(data.best?.avg ?? null)}</p>
              <p className="truncate text-[10px] text-white/35">{data.best?.name || "—"}</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-white/30">
            {scope === "team" && "Vlastní tým: průměr a nejlepší spoluhráč"}
            {scope === "allstar" && "All-star: průměr a nejlepší ze všech týmů v ročníku"}
            {scope === "other" && "Vybraný tým (stejný ročník): průměr a nejlepší"}
          </p>
        </div>
      )}

      {!scope && (
        <button
          type="button"
          onClick={() => load("team")}
          className="w-full rounded-2xl border border-red-500/25 bg-red-500/10 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/15"
        >
          Porovnat výkon →
        </button>
      )}
    </section>
  );
}
