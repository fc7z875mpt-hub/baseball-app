import Link from "next/link";

function DiamondLogo({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      {/* Outer diamond */}
      <path
        d="M60 8 L112 60 L60 112 L8 60 Z"
        fill="#0a1628"
        stroke="#ffffff"
        strokeWidth="3"
      />
      {/* Inner diamond */}
      <path
        d="M60 18 L102 60 L60 102 L18 60 Z"
        fill="#1e3a5f"
        stroke="#ffffff"
        strokeWidth="2"
      />
      {/* Baseball */}
      <circle cx="60" cy="60" r="22" fill="white" />
      {/* Red stitches left */}
      <path
        d="M48 48 Q52 60 48 72"
        stroke="#dc2626"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M46 52 L50 50" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 58 L50 56" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 64 L50 62" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 70 L50 68" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      {/* Red stitches right */}
      <path
        d="M72 48 Q68 60 72 72"
        stroke="#dc2626"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M70 50 L74 52" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 56 L74 58" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 62 L74 64" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 68 L74 70" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      {/* Corner stitch accents */}
      <path d="M30 50 L35 45" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M28 55 L34 52" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M90 50 L85 45" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M92 55 L86 52" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-12">
      {/* Soft stadium glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-blue-900/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-40 w-full -translate-x-1/2 bg-gradient-to-t from-red-950/20 to-transparent" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <DiamondLogo size={130} />

        <h1 className="mt-6 text-center text-4xl font-black tracking-tight text-white sm:text-5xl">
          DIAMOND
        </h1>
        <h2 className="-mt-1 text-center text-4xl font-black tracking-tight text-red-600 sm:text-5xl">
          YOUTH
        </h2>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-px w-10 bg-white/30" />
          <div className="flex h-1 w-8 overflow-hidden rounded-full">
            <div className="w-1/2 bg-blue-700" />
            <div className="w-1/2 bg-red-600" />
          </div>
          <div className="h-px w-10 bg-white/30" />
        </div>

        <p className="mt-3 text-center text-[11px] font-semibold tracking-[0.25em] text-white/60">
          CZECH YOUTH BASEBALL
        </p>

        <div className="mt-10 w-full space-y-3">
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl bg-red-600 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 active:scale-[0.98]"
          >
            Přihlásit se
          </Link>
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-xl border border-white/20 bg-transparent py-3.5 text-base font-semibold text-white transition hover:bg-white/5 active:scale-[0.98]"
          >
            Registrace
          </Link>
        </div>
      </div>
    </main>
  );
}
