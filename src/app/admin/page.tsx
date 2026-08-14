"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Player = {
  id: string;
  firstName: string;
  lastName: string;
  category: string | null;
};

type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  players: Player[];
};

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus === "authenticated") {
      if ((session?.user as any)?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      loadUsers();
    }
  }, [authStatus, session, router]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Nepodařilo se načíst uživatele");
      const data = await res.json();
      setUsers(data.users);
    } catch (e: any) {
      setError(e.message || "Chyba");
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(
    userId: string,
    payload: { status?: string; role?: string }
  ) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });
      if (!res.ok) throw new Error("Úprava selhala");
      await loadUsers();
    } catch (e: any) {
      setError(e.message || "Chyba");
    }
  }

  const filtered = users.filter((u) =>
    filter === "ALL" ? true : u.status === filter
  );

  if (authStatus === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">
        Načítám…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1628] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin panel</h1>
            <p className="text-sm text-white/50">Diamond Youth</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Odhlásit
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? "bg-red-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {f === "PENDING" && "Čekající"}
              {f === "APPROVED" && "Schválení"}
              {f === "REJECTED" && "Zamítnutí"}
              {f === "ALL" && "Všichni"}
              {f !== "ALL" && (
                <span className="ml-1.5 opacity-70">
                  ({users.filter((u) => u.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-12 text-center text-white/40">Žádní uživatelé v tomto filtru</p>
          )}

          {filtered.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-white/50">{user.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">
                      {user.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        user.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-300"
                          : user.status === "APPROVED"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  {user.players.length > 0 && (
                    <p className="mt-2 text-sm text-white/60">
                      Dítě:{" "}
                      {user.players
                        .map((p) => `${p.firstName} ${p.lastName}${p.category ? ` (${p.category})` : ""}`)
                        .join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {user.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateUser(user.id, { status: "APPROVED" })}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-500"
                      >
                        Schválit
                      </button>
                      <button
                        onClick={() => updateUser(user.id, { status: "REJECTED" })}
                        className="rounded-lg bg-red-600/80 px-3 py-1.5 text-sm font-medium hover:bg-red-600"
                      >
                        Zamítnout
                      </button>
                    </>
                  )}
                  {user.status === "APPROVED" && user.role === "PARENT" && (
                    <button
                      onClick={() => updateUser(user.id, { role: "ORGANIZER" })}
                      className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5"
                    >
                      → Organizátor
                    </button>
                  )}
                  {user.status === "APPROVED" && user.role === "ORGANIZER" && (
                    <button
                      onClick={() => updateUser(user.id, { role: "PARENT" })}
                      className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5"
                    >
                      → Rodič
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
