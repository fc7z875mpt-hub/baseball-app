"use client";

import { useState } from "react";

/** Admin-only: načte ukázkové zápasy a statistiky */
export function DemoStatsButton() {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/setup-demo-stats", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setMsg(
        `${data.message}: ${data.matchesCreated} zápasů, ${data.statsCreated} statistik (${data.players} hráčů)`
      );
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Chyba");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
      <p className="text-sm font-semibold text-sky-200">Demo statistiky (fáze 3)</p>
      <p className="mt-1 text-xs text-white/45">
        Vytvoří ukázkové zápasy a statistiky pro existující hráče, ať jde otestovat profil a grafy.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="mt-3 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {loading ? "Generuji…" : "Načíst demo data"}
      </button>
      {msg && <p className="mt-2 text-sm text-green-400">{msg}</p>}
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
    </div>
  );
}
