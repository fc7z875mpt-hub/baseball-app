"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatAvg } from "@/lib/stats";

type PlayerCard = {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
  category: string | null;
  team: { name: string; primaryColor: string } | null;
  stats: { games: number; hits: number; avg: number | null };
};

/**
 * Rodič: jen své děti.
 * Admin/organizátor: záměrně NEnačítá všechny hráče (stovky) – odkaz do adminu.
 */
export default function PlayersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "ADMIN" || role === "ORGANIZER";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (isStaff) {
      setLoading(false);
      return;
    }
    fetch("/api/players/me")
      .then((r) => r.json())
      .then((d) => setPlayers(d.players || []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [status, isStaff]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">
        Načítám…
      </main>
    );
  }

  if (isStaff) {
    return (
      <main className="px-4 pt-6">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-1 text-xl font-bold">Hráči</h1>
          <p className="mb-6 text-sm text-white/45">
            Seznam stovek hráčů se nenačítá najednou.
          </p>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/70">
              Správa hráčů, postup ročníků a filtry jsou v admin panelu – s
              filtrováním podle týmu a kategorie.
            </p>
            {role === "ADMIN" && (
              <Link
                href="/admin"
                className="mt-2 inline-block rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-500"
              >
                Otevřít admin panel
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-bold">Moje děti</h1>
        <p className="mb-5 text-sm text-white/45">Profily a statistiky</p>

        {players.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/40">
            Zatím žádný hráč
          </div>
        )}

        <div className="space-y-3">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/player/${p.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/[0.07]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                style={{ backgroundColor: p.team?.primaryColor || "#1e3a5f" }}
              >
                {p.jerseyNumber != null ? `#${p.jerseyNumber}` : "–"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-xs text-white/45">
                  {[p.team?.name, p.category].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right text-xs tabular-nums text-white/50">
                <p>{p.stats.games} G</p>
                <p>{formatAvg(p.stats.avg)} AVG</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
