"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type PlayerStat = {
  playerId: string;
  player: { id: string; firstName: string; lastName: string; jerseyNumber: number | null };
  atBats: number;
  hits: number;
  runs: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  errors: number;
};

type MatchDetail = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; primaryColor: string };
  awayTeam?: { id: string; name: string } | null;
  opponent: string;
  playerStats: PlayerStat[];
};

export default function MatchDetailPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login");
  }, [authStatus, router]);

  function load() {
    setLoading(true);
    fetch(`/api/matches/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Chyba");
        setMatch(d.match);
        setCanEdit(!!d.canEdit);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (authStatus !== "authenticated" || !id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, id]);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Chyba");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setBusy(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center text-white/50">Načítám…</main>
    );
  }

  if (error || !match) {
    return (
      <main className="px-4 pt-6">
        <Link href="/dashboard/matches" className="text-sm text-red-400">
          ← Zápasy
        </Link>
        <p className="mt-6 text-white/50">{error || "Zápas nenalezen"}</p>
      </main>
    );
  }

  return (
    <main className="px-4 pt-5 pb-8">
      <div className="mx-auto max-w-lg space-y-5">
        <Link href="/dashboard/matches" className="text-sm text-white/45 hover:text-white/70">
          ← Zápasy
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-white/45">
              {new Date(match.date).toLocaleDateString("cs-CZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {match.time ? ` · ${match.time}` : ""}
            </span>
            <StatusBadge status={match.status} />
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold">{match.homeTeam.name}</p>
              <p className="mt-1 text-3xl font-black tabular-nums">{match.homeScore}</p>
            </div>
            <span className="text-white/30">:</span>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold">{match.opponent}</p>
              <p className="mt-1 text-3xl font-black tabular-nums">{match.awayScore}</p>
            </div>
          </div>

          {match.location && (
            <p className="border-t border-white/5 pt-3 text-center text-xs text-white/40">
              📍 {match.location}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            {match.status === "SCHEDULED" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStatus("LIVE")}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Zahájit (ŽIVĚ)
              </button>
            )}
            {(match.status === "LIVE" || match.status === "SCHEDULED") && (
              <Link
                href={`/dashboard/score/${match.id}`}
                className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Zapsat statistiky
              </Link>
            )}
            {match.status === "LIVE" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStatus("FINISHED")}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Ukončit zápas
              </button>
            )}
            {match.status === "FINISHED" && (
              <Link
                href={`/dashboard/score/${match.id}`}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white"
              >
                Upravit statistiky
              </Link>
            )}
          </div>
        )}

        <section>
          <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Statistiky hráčů
          </h2>
          {match.playerStats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">
              Zatím žádné statistiky
              {canEdit && (
                <>
                  <br />
                  <Link href={`/dashboard/score/${match.id}`} className="mt-2 inline-block text-red-400">
                    Zapsat →
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead className="bg-white/5 text-[10px] uppercase tracking-wide text-white/40">
                  <tr>
                    <th className="px-3 py-2 font-medium">Hráč</th>
                    <th className="px-2 py-2 font-medium">AB</th>
                    <th className="px-2 py-2 font-medium">H</th>
                    <th className="px-2 py-2 font-medium">R</th>
                    <th className="px-2 py-2 font-medium">HR</th>
                    <th className="px-2 py-2 font-medium">RBI</th>
                    <th className="px-2 py-2 font-medium">BB</th>
                    <th className="px-2 py-2 font-medium">SO</th>
                    <th className="px-2 py-2 font-medium">E</th>
                  </tr>
                </thead>
                <tbody>
                  {match.playerStats.map((s) => (
                    <tr key={s.playerId} className="border-t border-white/5">
                      <td className="px-3 py-2.5 font-medium">
                        {s.player.jerseyNumber != null && (
                          <span className="mr-1 text-white/35">#{s.player.jerseyNumber}</span>
                        )}
                        {s.player.firstName} {s.player.lastName}
                      </td>
                      <td className="px-2 py-2.5 tabular-nums">{s.atBats}</td>
                      <td className="px-2 py-2.5 tabular-nums text-sky-300">{s.hits}</td>
                      <td className="px-2 py-2.5 tabular-nums">{s.runs}</td>
                      <td className="px-2 py-2.5 tabular-nums text-red-300">{s.homeRuns}</td>
                      <td className="px-2 py-2.5 tabular-nums">{s.rbi}</td>
                      <td className="px-2 py-2.5 tabular-nums">{s.walks}</td>
                      <td className="px-2 py-2.5 tabular-nums">{s.strikeouts}</td>
                      <td className="px-2 py-2.5 tabular-nums">{s.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
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
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cls}`}>{label}</span>;
}
