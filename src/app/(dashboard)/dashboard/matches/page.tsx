"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type TeamInfo = {
  id: string;
  name: string;
  shortName: string | null;
  primaryColor: string;
  logoUrl?: string | null;
};

type MatchRow = {
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
  statsCount?: number;
};

type TeamOpt = { id: string; name: string; shortName: string | null };

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const canEdit = role === "ADMIN" || role === "ORGANIZER";

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "LIVE" | "FINISHED">("ALL");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [teams, setTeams] = useState<TeamOpt[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    location: "",
    homeTeamId: "",
    awayTeamId: "",
    awayTeamName: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function load() {
    setLoading(true);
    const q = filter === "ALL" ? "" : `?status=${filter}`;
    fetch(`/api/matches${q}`)
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filter]);

  useEffect(() => {
    if (!canEdit) return;
    fetch("/api/teams")
      .then((r) => r.json())
      .then((d) => setTeams(d.teams || []))
      .catch(() => {});
  }, [canEdit]);

  async function createMatch(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          time: form.time || null,
          location: form.location || null,
          homeTeamId: form.homeTeamId,
          awayTeamId: form.awayTeamId || null,
          awayTeamName: form.awayTeamId ? null : form.awayTeamName,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Chyba");
      setShowCreate(false);
      router.push(`/dashboard/matches/${d.match.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center text-white/50">Načítám zápasy…</main>
    );
  }

  return (
    <main className="px-4 pt-5">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Zápasy</h1>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              {showCreate ? "Zavřít" : "+ Nový zápas"}
            </button>
          )}
        </div>

        {showCreate && canEdit && (
          <form onSubmit={createMatch} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold">Nový zápas</p>
            {err && <p className="text-sm text-red-400">{err}</p>}
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-white/50">
                Datum
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-white/50">
                Čas
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
            <label className="block text-xs text-white/50">
              Místo
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="např. Brno – Hroší park"
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-white/50">
              Domácí tým
              <select
                required
                value={form.homeTeamId}
                onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
              >
                <option value="">— vyber —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-white/50">
              Soupeř (tým v systému)
              <select
                value={form.awayTeamId}
                onChange={(e) => setForm({ ...form, awayTeamId: e.target.value, awayTeamName: "" })}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
              >
                <option value="">— nebo zadej název níže —</option>
                {teams
                  .filter((t) => t.id !== form.homeTeamId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </label>
            {!form.awayTeamId && (
              <label className="block text-xs text-white/50">
                Soupeř (název mimo systém)
                <input
                  value={form.awayTeamName}
                  onChange={(e) => setForm({ ...form, awayTeamName: e.target.value })}
                  placeholder="např. Tigers Praha"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#0a1628] px-3 py-2 text-sm text-white"
                />
              </label>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Ukládám…" : "Vytvořit zápas"}
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "LIVE", "SCHEDULED", "FINISHED"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${
                filter === f ? "bg-red-600 text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {f === "ALL" ? "Vše" : f === "LIVE" ? "Živě" : f === "SCHEDULED" ? "Plán" : "Odehrané"}
            </button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Žádné zápasy
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/matches/${m.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-white/45">
                    {formatDate(m.date)}
                    {m.time ? ` · ${m.time}` : ""}
                  </span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.homeTeam.name}</p>
                    <p className="truncate text-sm text-white/50">vs {m.opponent}</p>
                  </div>
                  {(m.status === "LIVE" || m.status === "FINISHED") && (
                    <p className="shrink-0 text-lg font-bold tabular-nums">
                      {m.homeScore}:{m.awayScore}
                    </p>
                  )}
                </div>
                {m.location && <p className="mt-2 text-[11px] text-white/35">📍 {m.location}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "LIVE"
      ? "bg-red-500/20 text-red-300"
      : status === "FINISHED"
        ? "bg-white/10 text-white/50"
        : "bg-sky-500/20 text-sky-300";
  const label =
    status === "LIVE" ? "ŽIVĚ" : status === "FINISHED" ? "Konec" : status === "CANCELLED" ? "Zrušen" : "Plán";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>{label}</span>
  );
}
