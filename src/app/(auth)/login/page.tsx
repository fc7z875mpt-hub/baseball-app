"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Něco se pokazilo. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 p-4">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" aria-hidden>
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
                <path d="M10 16 Q24 24 10 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M38 16 Q24 24 38 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-lg font-bold">Baseball Statistiky</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <h1 className="mb-6 text-center text-2xl font-bold text-primary">Přihlášení</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="vas@email.cz"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? "Přihlašuji…" : "Přihlásit se"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <Link href="/forgot-password" className="block text-primary hover:underline">
              Zapomenuté heslo?
            </Link>
            <p className="text-slate-500">
              Nemáte účet?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Registrujte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
