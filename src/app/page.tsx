import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100">
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-indigo-100/50 blur-2xl" />
        {/* Subtle baseball stitch lines */}
        <svg
          className="absolute bottom-8 left-8 h-32 w-32 text-primary/5"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden
        >
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 35 Q50 50 20 65"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M80 35 Q50 50 80 65"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        <svg
          className="absolute top-16 right-12 h-24 w-24 text-sky-300/20"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden
        >
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 35 Q50 50 20 65"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M80 35 Q50 50 80 65"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-12">
        {/* Logo / brand mark */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <svg
              viewBox="0 0 48 48"
              className="h-11 w-11 text-white"
              fill="none"
              aria-hidden
            >
              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
              <path
                d="M10 16 Q24 24 10 32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M38 16 Q24 24 38 32"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Baseball Statistiky
          </h1>
          <p className="mt-2 text-center text-base text-slate-600">
            Moderní aplikace pro mládežnické baseballové týmy
          </p>
        </div>

        {/* Main card */}
        <div className="w-full rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <div className="space-y-3">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-base font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-600 hover:shadow-lg active:scale-[0.98]"
            >
              Přihlásit se
            </Link>
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 bg-white px-5 py-3.5 text-base font-semibold text-primary transition hover:border-primary hover:bg-primary-50 active:scale-[0.98]"
            >
              Registrace
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-600">Statistiky</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-600">Živý zápis</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-600">Týmy</p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Pro rodiče, organizátory a administrátory
        </p>
      </div>
    </main>
  );
}
