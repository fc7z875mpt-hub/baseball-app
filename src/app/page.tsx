import Link from "next/link";

const TEAMS = [
  { name: "Hroši", color: "#1e3a5f", letter: "H" },
  { name: "Draci", color: "#b91c1c", letter: "D" },
  { name: "Arrows", color: "#0369a1", letter: "A" },
  { name: "Tempo", color: "#15803d", letter: "T" },
  { name: "Technika", color: "#7c3aed", letter: "T" },
  { name: "SaBaT", color: "#c2410c", letter: "S" },
  { name: "Kotlářka", color: "#0e7490", letter: "K" },
  { name: "Eagles", color: "#1d4ed8", letter: "E" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1220]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[90px]" />
      </div>

      {/* Floating team badges */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {TEAMS.map((team, i) => {
          const positions = [
            "top-[12%] left-[6%]",
            "top-[18%] right-[8%]",
            "top-[42%] left-[3%]",
            "top-[38%] right-[4%]",
            "bottom-[22%] left-[8%]",
            "bottom-[18%] right-[7%]",
            "bottom-[8%] left-[28%]",
            "bottom-[10%] right-[26%]",
          ];
          const sizes = ["h-11 w-11", "h-14 w-14", "h-10 w-10", "h-12 w-12", "h-13 w-13", "h-11 w-11", "h-10 w-10", "h-12 w-12"];
          return (
            <div
              key={team.name}
              className={`absolute ${positions[i]} hidden sm:flex ${sizes[i]} items-center justify-center rounded-full border border-white/10 shadow-lg opacity-70`}
              style={{ backgroundColor: team.color }}
              title={team.name}
            >
              <span className="text-sm font-bold text-white/90">{team.letter}</span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
        {/* Ball icon */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-400 to-blue-600 shadow-2xl shadow-sky-500/30">
          <svg viewBox="0 0 48 48" className="h-14 w-14 text-white" fill="none" aria-hidden>
            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
            <path d="M10 16 Q24 24 10 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M38 16 Q24 24 38 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="mb-10 text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Baseball
          <span className="block bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
            Statistiky
          </span>
        </h1>

        {/* CTA card */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
          <div className="space-y-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              Přihlásit se
            </Link>
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-base font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Registrace
            </Link>
          </div>

          {/* Feature pills */}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {["Živé skóre", "Statistiky hráčů", "Zápis na mobilu"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-200/80"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile team row */}
        <div className="mt-10 flex gap-2 sm:hidden">
          {TEAMS.slice(0, 6).map((team) => (
            <div
              key={team.name}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10"
              style={{ backgroundColor: team.color }}
            >
              <span className="text-xs font-bold text-white">{team.letter}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
