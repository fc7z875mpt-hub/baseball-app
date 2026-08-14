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
        setError(data.error || "Registrace se nezdarila");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Neco se pokazilo. Zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-secondary-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Registrace odeslana</h1>
          <p className="text-slate-600 mb-6">
            Vas ucet ceka na schvaleni administratorem.
          </p>
          <Link href="/login" className="inline-block py-3 px-6 bg-primary text-white font-semibold rounded-xl">
            Zpet na prihlaseni
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-secondary-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-primary text-center mb-6">Registrace</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jmeno rodice</label>
                <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijmeni rodice</label>
                <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heslo</label>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none"
                placeholder="Min. 8 znaku, velke pismeno a cislo" />
            </div>
            <hr className="border-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jmeno ditete</label>
                <input type="text" value={form.childFirstName} onChange={(e) => update("childFirstName", e.target.value)} required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prijmeni ditete</label>
                <input type="text" value={form.childLastName} onChange={(e) => update("childLastName", e.target.value)} required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rocnik (rok narozeni)</label>
              <input type="number" value={form.birthYear} onChange={(e) => update("birthYear", e.target.value)}
                min={2010} max={2022} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl outline-none"
                placeholder="napr. 2016" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl disabled:opacity-50">
              {loading ? "Odesilam..." : "Registrovat se"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Uz mate ucet? <Link href="/login" className="text-primary hover:underline">Prihlaste se</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
