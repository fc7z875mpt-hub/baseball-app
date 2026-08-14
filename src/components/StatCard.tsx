"use client";

import { useState } from "react";

const HINTS: Record<string, string> = {
  Zápasy: "Počet odehraných zápasů v sezóně",
  G: "Počet odehraných zápasů",
  Hity: "Úspěšné odpaly (1B + 2B + 3B + HR)",
  H: "Úspěšné odpaly",
  Doběhy: "Doběhy – kolikrát hráč doběhl domů",
  R: "Doběhy (runs)",
  HR: "Home runy – odpal za všechny mety najednou",
  AVG: "Batting average – hity / at-bats (úspěšnost na pálce)",
  OBP: "On-base percentage – jak často se dostane na metu",
  SLG: "Slugging – síla odpalů (vážený průměr)",
  OPS: "OBP + SLG – celkový útočný výkon",
  RBI: "Runs batted in – doběhy spoluhráčů díky odpalu",
  BB: "Walks – postupy zdarma (4 baly)",
  SO: "Strikeouty – vyautování na pálce",
  Chyby: "Fielding errors – chyby v poli",
  Putout: "Outy, které hráč přímo dokončil",
  Asistence: "Přihrávky, které vedly k outu",
  "1B": "Singles – odpal na 1. metu",
  "2B": "Doubles – odpal na 2. metu",
  "3B": "Triples – odpal na 3. metu",
};

export function StatCard({
  label,
  value,
  sub,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "red" | "blue" | "green" | "default";
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const explanation = hint || HINTS[label];

  const accentClass =
    accent === "red"
      ? "text-red-400"
      : accent === "blue"
        ? "text-sky-400"
        : accent === "green"
          ? "text-emerald-400"
          : "text-white";

  return (
    <button
      type="button"
      onClick={() => explanation && setOpen((v) => !v)}
      className={`relative w-full rounded-2xl border border-white/10 bg-[#0d1b2e] px-3 py-3 text-center transition ${
        explanation ? "active:scale-[0.98] hover:border-white/20" : ""
      }`}
    >
      <p className={`text-2xl font-bold tabular-nums ${accentClass}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/45">
        {label}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-white/30">{sub}</p>}
      {open && explanation && (
        <div className="absolute inset-x-1 bottom-full z-20 mb-1 rounded-xl border border-sky-500/30 bg-[#0a1628] px-2.5 py-2 text-left text-[11px] leading-snug text-sky-100 shadow-xl">
          {explanation}
        </div>
      )}
    </button>
  );
}
