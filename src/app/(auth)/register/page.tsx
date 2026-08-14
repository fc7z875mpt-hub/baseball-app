"use client";

import { useState } from "react";
import Link from "next/link";

function DiamondLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M60 8 L112 60 L60 112 L8 60 Z" fill="#0a1628" stroke="#ffffff" strokeWidth="3" />
      <path d="M60 18 L102 60 L60 102 L18 60 Z" fill="#1e3a5f" stroke="#ffffff" strokeWidth="2" />
      <circle cx="60" cy="60" r="22" fill="white" />
      <path d="M48 48 Q52 60 48 72" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 48 Q68 60 72 72" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

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

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30";

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Registrace odeslána</h1>
          <p className="mb-8 text-white/60">
            Váš účet čeká na schválení administrátorem.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500"
          >
            Zpět na přihlášení
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a1628] px-6 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-[400px] -translate-x-1/2 rounded-full bg-blue-900/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <DiamondLogo size={64} />
          <h1 className="mt-3 text-xl font-black text-white">DIAMOND <span className="text-red-600">YOUTH</span></h1>
          <p className="mt-1 text-sm text-white/50">Registrace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
              placeholder="Jméno rodiče"
              className={inputClass}
            />
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
              placeholder="Příjmení rodiče"
              className={inputClass}
            />
          </div>

          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            placeholder="E-mail"
            className={inputClass}
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
            placeholder="Heslo (min. 8 znaků)"
            className={inputClass}
          />

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/40">
              Údaje o dítěti
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.childFirstName}
                onChange={(e) => update("childFirstName", e.target.value)}
                required
                placeholder="Jméno dítěte"
                className={inputClass}
              />
              <input
                type="text"
                value={form.childLastName}
                onChange={(e) => update("childLastName", e.target.value)}
                required
                placeholder="Příjmení dítěte"
                className={inputClass}
              />
            </div>
          </div>

          <input
            type="number"
            value={form.birthYear}
            onChange={(e) => update("birthYear", e.target.value)}
            min={2010}
            max={2022}
            placeholder="Rok narození (např. 2016)"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-red-600 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? "Odesílám…" : "Registrovat se"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Už máš účet?{" "}
          <Link href="/login" className="font-semibold text-red-500 hover:text-red-400">
            Přihlas se
          </Link>
        </p>
      </div>
    </main>
  );
}
