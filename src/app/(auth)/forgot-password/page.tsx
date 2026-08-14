"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-secondary-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">email</div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            E-mail odeslan
          </h1>
          <p className="text-slate-600 mb-6">
            Pokud ucet s timto e-mailem existuje, poslali jsme vam odkaz pro
            obnoveni hesla.
          </p>
          <Link href="/login" className="text-primary hover:underline font-medium">
            Zpet na prihlaseni
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary-50 to-secondary-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-primary text-center mb-2">
          Zapomenute heslo
        </h1>
        <p className="text-slate-600 text-center text-sm mb-6">
          Zadejte e-mail a posleme vam odkaz pro obnoveni hesla.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="vas@email.cz"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? "Odesilam..." : "Odeslat odkaz"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            Zpet na prihlaseni
          </Link>
        </p>
      </div>
    </main>
  );
}
