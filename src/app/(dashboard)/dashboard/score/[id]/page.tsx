"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type RosterPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
};

type Row = {
  playerId: string;
  name: string;
  jersey: number | null;
  atBats: number;
  hits: number;
  runs: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  errors: number;
};

export default function ScoreMatchPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const role = session?.user?.role;
  const allowed = role === "ADMIN" || role === "ORGANIZER";

  const [title, setTitle] = useState("");
  const [matchStatus, setMatchStatus] = useState("SCHEDULED");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !id || !allowed) return;
    fetch(`/api/matches/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Chyba");
        if (!d.canEdit) throw new Error("Nemáš oprávnění");
        const m = d.match;
        setTitle(`${m.homeTeam.name} vs ${m.opponent}`);
        setMatchStatus(m.status);
        setHomeScore(m.homeScore);
        setAwayScore(m.awayScore);

        const byId = new Map(
          (m.playerStats || []).map((s: { playerId: string } & Record<string, number>) => [s.playerId, s])
        );
        const roster = (d.roster || []) as RosterPlayer[];
        setRows(
          roster.map((p) => {
            const s = byId.get(p.id) as
              | {
                  atBats: number;
                  hits: number;
                  runs: number;
                  homeRuns: number;
                  rbi: number;
                  walks: number;
                  strikeouts: number;
                  errors: number;
                }
              | undefined;
            return {
              playerId: p.id,
              name: `${p.firstName} ${p.lastName}`,
              jersey: p.jerseyNumber,
              atBats: s?.atBats ?? 0,
              hits: s?.hits ?? 0,
              runs: s?.runs ?? 0,
              homeRuns: s?.homeRuns ?? 0,
              rbi: s?.rbi ?? 0,
              walks: s?.walks ?? 0,
              strikeouts: s?.strikeouts ?? 0,
              errors: s?.errors ?? 0,
            };
          })
        );
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [authStatus, id, allowed]);

  function bump(playerId: string, field: keyof Row, delta: number) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.playerId !== playerId) return r;
        const next = { ...r };
        const key = field as keyof Row;
        if (typeof next[key] === "number") {
          (next as Record<string, unknown>)[key] = Math.max(0, (next[key] as number) + delta);
        }
        // hity nesmí přesáhnout AB (měkce)
        if (field === "hits" && next.hits > next.atBats) next.atBats = next.hits;
        if (field === "homeRuns" && next.homeRuns > next.hits) next.hits = next.homeRuns;
        if (field === "atBats" && next.atBats < next.hits) next.hits = next.atBats;
        return next;
      })
    );
  }

  function setField(playerId: string, field: keyof Row, value: number) {
    setRows((prev) =>
      prev.map((r) => (r.playerId === playerId ? { ...r, [field]: Math.max(0, value) } : r))
    );
  }

  async function save(finish: boolean) {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const status =
        finish ? "FINISHED" : matchStatus === "SCHEDULED" ? "LIVE" : matchStatus;
      const res = await fetch(`/api/matches/${id}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeScore,
          awayScore,
          status,
          stats: rows.map((r) => ({
            playerId: r.playerId,
            atBats: r.atBats,
            hits: r.hits,
            homeRuns: r.homeRuns,
            runs: r.runs,
            rbi: r.rbi,
            walks: r.walks,
            strikeouts: r.strikeouts,
            errors: r.errors,
          })),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Uložení selhalo");
      setMatchStatus(d.status || status);
      setMsg(finish ? "Zápas ukončen a statistiky uloženy" : "Uloženo");
      if (finish) {
        setTimeout(() => router.push(`/dashboard/matches/${id}`), 800);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center text-white/50">Načítám zápis…</main>
    );
  }

  if (!allowed) {
    return (
      <main className="px-4 pt-10 text-center text-sm text-white/50">
        Jen organizátor / admin
        <br />
        <Link href="/dashboard" className="mt-3 inline-block text-red-400">
          ← Domů
        </Link>
      </main>
    );
  }

  if (err && rows.length === 0) {
    return (
      <main className="px-4 pt-6">
        <Link href="/dashboard/matches" className="text-sm text-red-400">
          ← Zápasy
        </Link>
        <p className="mt-6 text-red-300">{err}</p>
      </main>
    );
  }

  return (
    <main className="px-3 pt-4 pb-28">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/dashboard/matches/${id}`} className="text-xs text-white/40">
              ← Detail zápasu
            </Link>
            <h1 className="mt-1 text-lg font-bold leading-tight">{title || "Zápis"}</h1>
            <p className="text-[11px] text-white/40">
              {matchStatus === "LIVE" ? "Živě" : matchStatus === "FINISHED" ? "Ukončený" : "Plánovaný"}
            </p>
          </div>
        </div>

        {/* Skóre */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Skóre
          </p>
          <div className="flex items-center justify-center gap-4">
            <ScoreControl label="Domácí" value={homeScore} onChange={setHomeScore} />
            <span className="text-2xl font-black text-white/30">:</span>
            <ScoreControl label="Hosté" value={awayScore} onChange={setAwayScore} />
          </div>
        </div>

        {msg && <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{msg}</p>}
        {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}

        {/* Hráči – rychlé +/- */}
        <div className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Statistiky hráčů ({rows.length})
          </p>
          {rows.length === 0 && (
            <p className="text-sm text-white/40">Tým nemá aktivní hráče – přiřaď je v adminu.</p>
          )}
          {rows.map((r) => (
            <div key={r.playerId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 text-sm font-semibold">
                {r.jersey != null && <span className="mr-1 text-white/35">#{r.jersey}</span>}
                {r.name}
              </p>
              <div className="grid grid-cols-4 gap-2">
                <StatStepper label="AB" value={r.atBats} onDec={() => bump(r.playerId, "atBats", -1)} onInc={() => bump(r.playerId, "atBats", 1)} />
                <StatStepper label="H" value={r.hits} onDec={() => bump(r.playerId, "hits", -1)} onInc={() => bump(r.playerId, "hits", 1)} accent="sky" />
                <StatStepper label="R" value={r.runs} onDec={() => bump(r.playerId, "runs", -1)} onInc={() => bump(r.playerId, "runs", 1)} accent="emerald" />
                <StatStepper label="HR" value={r.homeRuns} onDec={() => bump(r.playerId, "homeRuns", -1)} onInc={() => bump(r.playerId, "homeRuns", 1)} accent="red" />
                <StatStepper label="RBI" value={r.rbi} onDec={() => bump(r.playerId, "rbi", -1)} onInc={() => bump(r.playerId, "rbi", 1)} />
                <StatStepper label="BB" value={r.walks} onDec={() => bump(r.playerId, "walks", -1)} onInc={() => bump(r.playerId, "walks", 1)} />
                <StatStepper label="SO" value={r.strikeouts} onDec={() => bump(r.playerId, "strikeouts", -1)} onInc={() => bump(r.playerId, "strikeouts", 1)} />
                <StatStepper label="E" value={r.errors} onDec={() => bump(r.playerId, "errors", -1)} onInc={() => bump(r.playerId, "errors", 1)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky actions */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-white/10 bg-[#0a1628]/95 px-3 py-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="flex-1 rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Uložit a ukončit
          </button>
        </div>
      </div>
    </main>
  );
}

function ScoreControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="text-center">
      <p className="mb-1 text-[10px] text-white/40">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-10 w-10 rounded-full bg-white/10 text-lg font-bold"
        >
          −
        </button>
        <span className="w-10 text-2xl font-black tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 rounded-full bg-white/10 text-lg font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

function StatStepper({
  label,
  value,
  onDec,
  onInc,
  accent,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  accent?: "sky" | "emerald" | "red";
}) {
  const color =
    accent === "sky"
      ? "text-sky-300"
      : accent === "emerald"
        ? "text-emerald-300"
        : accent === "red"
          ? "text-red-300"
          : "text-white";
  return (
    <div className="rounded-xl bg-black/20 px-1 py-1.5 text-center">
      <p className="text-[9px] text-white/35">{label}</p>
      <div className="mt-0.5 flex items-center justify-center gap-1">
        <button type="button" onClick={onDec} className="h-7 w-7 rounded-lg bg-white/10 text-sm">
          −
        </button>
        <span className={`w-5 text-sm font-bold tabular-nums ${color}`}>{value}</span>
        <button type="button" onClick={onInc} className="h-7 w-7 rounded-lg bg-white/10 text-sm">
          +
        </button>
      </div>
    </div>
  );
}
