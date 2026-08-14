/** Mini line/bar trend hits per game */

export type TrendPoint = {
  label: string;
  hits: number;
  atBats: number;
};

export function TrendChart({
  points,
  title = "Hity v zápasech",
}: {
  points: TrendPoint[];
  title?: string;
}) {
  if (!points.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
        Zatím žádné zápasy
      </div>
    );
  }

  const max = Math.max(1, ...points.map((p) => p.hits));
  const h = 80;
  const barW = Math.min(28, Math.floor(280 / points.length) - 4);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">{title}</p>
      <div className="flex items-end justify-between gap-1" style={{ height: h }}>
        {points.map((p, i) => {
          const barH = Math.max(p.hits > 0 ? 6 : 2, (p.hits / max) * h);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] tabular-nums text-white/50">
                {p.hits}/{p.atBats}
              </span>
              <div
                className="w-full max-w-[28px] rounded-t-md bg-red-500/90"
                style={{ height: barH, width: barW }}
                title={`${p.label}: ${p.hits} H / ${p.atBats} AB`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between gap-1">
        {points.map((p, i) => (
          <span
            key={i}
            className="flex-1 truncate text-center text-[9px] text-white/35"
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
