export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "red" | "blue" | "green" | "default";
}) {
  const accentClass =
    accent === "red"
      ? "text-red-400"
      : accent === "blue"
        ? "text-sky-400"
        : accent === "green"
          ? "text-emerald-400"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${accentClass}`}>{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/45">
        {label}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-white/30">{sub}</p>}
    </div>
  );
}
