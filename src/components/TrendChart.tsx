/** Line chart – výkon / porovnání */

export type TrendPoint = {
  label: string;
  hits: number;
  atBats: number;
};

export type CompareSeries = {
  label: string;
  color: string;
  values: number[];
};

export function TrendChart({
  points,
  title = "Výkon v posledních zápasech",
  series,
}: {
  points?: TrendPoint[];
  title?: string;
  /** Volitelné další křivky (porovnání) – stejný počet bodů jako points */
  series?: CompareSeries[];
}) {
  const base =
    points && points.length
      ? points.map((p) =>
          p.atBats > 0 ? Math.round((p.hits / p.atBats) * 100) : p.hits * 20
        )
      : series?.[0]?.values || [];

  if (!base.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4 text-sm text-white/40">
        Zatím žádné zápasy pro graf
      </div>
    );
  }

  const allSeries: CompareSeries[] = [
    { label: "Výkon", color: "#38bdf8", values: base },
    ...(series || []),
  ];

  const labels =
    points?.map((p, i) => p.label || `Z${i + 1}`) ||
    base.map((_, i) => `Z${i + 1}`);

  const w = 320;
  const h = 120;
  const padX = 28;
  const padY = 16;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const maxY = 100;

  function pathFor(values: number[]) {
    const coords = values.map((v, i) => {
      const x =
        padX +
        (values.length === 1 ? chartW / 2 : (i / (values.length - 1)) * chartW);
      const y = padY + chartH - (Math.min(Math.max(v, 0), maxY) / maxY) * chartH;
      return { x, y };
    });
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
    return { line, coords };
  }

  const primary = pathFor(base);
  const first = base[0] ?? 0;
  const last = base[base.length - 1] ?? 0;
  const trend = last - first;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
        {title}
      </p>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 130 }}>
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padY + chartH - (g / maxY) * chartH;
          return (
            <g key={g}>
              <line x1={padX} x2={w - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padX - 4} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="9">{g}</text>
            </g>
          );
        })}

        {allSeries.map((s) => {
          const { line, coords } = pathFor(s.values);
          return (
            <g key={s.label}>
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {coords.map((c, i) => (
                <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="#0d1b2e" stroke={s.color} strokeWidth="2" />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between px-1">
        {labels.map((lb, i) => (
          <span key={i} className="text-[10px] text-white/35">{lb}</span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/5 pt-2 text-[11px] text-white/45">
        {allSeries.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
        {!series?.length && (
          <span className={`ml-auto ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            Trend: {trend >= 0 ? "↗" : "↘"} {Math.abs(trend)} %
          </span>
        )}
      </div>
    </div>
  );
}
