/** Jednoduchý horizontální bar chart (SVG), bez závislostí */

export type BarItem = { label: string; value: number; color?: string };

export function BarChart({
  items,
  title,
}: {
  items: BarItem[];
  title?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      {title && (
        <p className="mb-3 text-sm font-semibold text-white/80">{title}</p>
      )}
      <div className="space-y-2.5">
        {items.map((item) => {
          const pct = Math.round((item.value / max) * 100);
          return (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-right text-xs text-white/50">
                {item.label}
              </span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color || "#e11d2e",
                    minWidth: item.value > 0 ? 4 : 0,
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-white/70">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
