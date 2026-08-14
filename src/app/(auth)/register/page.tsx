"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    childFirstName: "",
    childLastName: "",
    birthYear: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
          teamIds: ["placeholder"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registrace se nezdařila");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Něco se pokazilo. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-primary">Registrace odeslána</h1>
          <p className="mb-6 text-slate-600">
            Váš účet čeká na schválení administrátorem. Po schválení se budete moci přihlásit.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-md"
          >
            Zpět na přihlášení
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 p-4 py-10">
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
          <h1 className="mb-6 text-center text-2xl font-bold text-primary">Registrace</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Jméno rodiče</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Příjmení rodiče</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Heslo</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Min. 8 znaků, velké písmeno a číslo"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Údaje o dítěti
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Jméno dítěte</label>
                  <input
                    type="text"
                    value={form.childFirstName}
                    onChange={(e) => update("childFirstName", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Příjmení dítěte</label>
                  <input
                    type="text"
                    value={form.childLastName}
                    onChange={(e) => update("childLastName", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ročník (rok narození)</label>
              <input
                type="number"
                value={form.birthYear}
                onChange={(e) => update("birthYear", e.target.value)}
                min={2010}
                max={2022}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="např. 2016"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? "Odesílám…" : "Registrovat se"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Už máte účet?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Přihlaste se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
