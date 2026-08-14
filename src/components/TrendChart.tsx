/** Line chart – výkon v posledních zápasech (dle mockupu) */

export type TrendPoint = {
  label: string;
  hits: number;
  atBats: number;
};

export function TrendChart({
  points,
  title = "Výkon v posledních zápasech",
}: {
  points: TrendPoint[];
  title?: string;
}) {
  if (!points.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4 text-sm text-white/40">
        Zatím žádné zápasy pro graf
      </div>
    );
  }

  // % úspěšnosti (hits/atBats), fallback na relativní hity
  const values = points.map((p) =>
    p.atBats > 0 ? Math.round((p.hits / p.atBats) * 100) : p.hits * 20
  );
  const w = 320;
  const h = 110;
  const padX = 12;
  const padY = 16;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const maxY = 100;

  const coords = values.map((v, i) => {
    const x =
      padX +
      (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
    const y = padY + chartH - (Math.min(v, maxY) / maxY) * chartH;
    return { x, y, v };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area =
    coords.length > 0
      ? `${line} L${coords[coords.length - 1].x},${padY + chartH} L${coords[0].x},${padY + chartH} Z`
      : "";

  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const trend = last - first;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 3 3 5-6" />
          </svg>
          {title}
        </p>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 120 }}>
        {/* grid lines */}
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padY + chartH - (g / maxY) * chartH;
          return (
            <g key={g}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={padX - 2}
                y={y + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.25)"
                fontSize="9"
              >
                {g}
              </text>
            </g>
          );
        })}

        <path d={area} fill="rgba(56,189,248,0.12)" />
        <path
          d={line}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="4"
            fill="#0d1b2e"
            stroke="#38bdf8"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="mt-1 flex justify-between px-1">
        {points.map((p, i) => (
          <span key={i} className="text-[10px] text-white/35">
            {p.label || `Z${i + 1}`}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-white/40">
        <span>Výkon (%)</span>
        <span className={trend >= 0 ? "text-emerald-400" : "text-red-400"}>
          Trend: {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)} %
        </span>
      </div>
    </div>
  );
}
