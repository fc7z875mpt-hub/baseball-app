"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ScorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const allowed = role === "ORGANIZER" || role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">
        Načítám…
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="px-4 pt-10">
        <div className="mx-auto max-w-lg text-center text-sm text-white/50">
          Zápis zápasu je jen pro organizátory a adminy.
          <br />
          <Link href="/dashboard" className="mt-4 inline-block text-red-400">
            ← Domů
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-bold">Zápis zápasu</h1>
        <p className="mb-6 text-sm text-white/45">Živý scoring na mobilu</p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-4xl">✎</p>
          <p className="mt-3 font-semibold">Připravujeme (fáze 4)</p>
          <p className="mt-2 text-sm text-white/45">
            Vytvoření zápasu, sestavy, směny, outy a automatické statistiky – dle
            zadání 4.4–4.5.
          </p>
          <Link
            href="/dashboard/matches"
            className="mt-5 inline-block text-sm text-red-400 hover:text-red-300"
          >
            Kalendář zápasů →
          </Link>
        </div>
      </div>
    </main>
  );
}
