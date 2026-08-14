"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type MatchRow = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { name: string; shortName: string | null; primaryColor: string };
  opponent: string;
};

export default function MatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/matches/upcoming")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">
        Načítám zápasy…
      </main>
    );
  }

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-bold">Zápasy</h1>
        <p className="mb-5 text-sm text-white/45">Program a výsledky</p>

        {matches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Zatím žádné zápasy v kalendáři.
            <p className="mt-2 text-xs text-white/30">
              Organizátor je vytvoří při zápisu zápasu.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {matches.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-white/45">
                  {new Date(m.date).toLocaleDateString("cs-CZ", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                  {m.time ? ` · ${m.time}` : ""}
                </span>
                <StatusBadge status={m.status} />
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {m.homeTeam.shortName || m.homeTeam.name}
                  <span className="mx-2 text-white/30">vs</span>
                  {m.opponent}
                </p>
                {(m.status === "LIVE" || m.status === "FINISHED") && (
                  <span className="text-lg font-black tabular-nums">
                    {m.homeScore}:{m.awayScore}
                  </span>
                )}
              </div>
              {m.location && (
                <p className="mt-1 text-xs text-white/35">{m.location}</p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/30">
          Kompletní historie a filtr týmů – připravujeme
        </p>
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
    status === "LIVE" ? "ŽIVĚ" : status === "FINISHED" ? "Konec" : "Plán";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>
      {label}
    </span>
  );
}
