"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type MatchRow = {
  id: string;
  date: string;
  time: string | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { name: string };
  opponent: string;
};

export default function ScorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const allowed = role === "ORGANIZER" || role === "ADMIN";

  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !allowed) return;
    Promise.all([
      fetch("/api/matches?status=LIVE").then((r) => r.json()),
      fetch("/api/matches?status=SCHEDULED").then((r) => r.json()),
    ])
      .then(([live, sched]) => {
        setMatches([...(live.matches || []), ...(sched.matches || [])]);
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [status, allowed]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">Načítám…</main>
    );
  }

  if (!allowed) {
    return (
      <main className="px-4 pt-10">
        <div className="mx-auto max-w-lg text-center text-sm text-white/50">
          Zápis zápasu je jen pro organizátory a adminy.
          <br />
          <Link href="/dashboard" className="mt-4 inline-block text-red-400">
            ← Domů
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg space-y-4">
        <div>
          <h1 className="text-xl font-bold">Zápis zápasu</h1>
          <p className="text-sm text-white/45">Vyber zápas nebo vytvoř nový</p>
        </div>

        <Link
          href="/dashboard/matches"
          className="flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-200"
        >
          + Nový zápas / kalendář
        </Link>

        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Žádný živý ani naplánovaný zápas.
            <br />
            Vytvoř zápas v kalendáři.
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/score/${m.id}`}
                className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06]"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {new Date(m.date).toLocaleDateString("cs-CZ", {
                      day: "numeric",
                      month: "short",
                    })}
                    {m.time ? ` · ${m.time}` : ""}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      m.status === "LIVE"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-sky-500/20 text-sky-300"
                    }`}
                  >
                    {m.status === "LIVE" ? "ŽIVĚ" : "Plán"}
                  </span>
                </div>
                <p className="font-semibold">
                  {m.homeTeam.name} vs {m.opponent}
                </p>
                {m.status === "LIVE" && (
                  <p className="mt-1 text-sm tabular-nums text-white/50">
                    {m.homeScore}:{m.awayScore}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
