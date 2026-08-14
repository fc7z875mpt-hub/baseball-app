import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50 to-secondary-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">
            Baseball Statistiky
          </h1>
          <p className="text-slate-600">
            Aplikace pro mladeznicke baseballove tymy
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition"
          >
            Prihlasit se
          </Link>
          <Link
            href="/register"
            className="block w-full py-3 px-4 bg-white text-primary font-semibold rounded-xl border-2 border-primary hover:bg-primary-50 transition"
          >
            Registrace
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Pro rodice, organizatory a administratory
        </p>
      </div>
    </main>
  );
}
