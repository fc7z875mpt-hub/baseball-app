"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "users" | "teams" | "seasons" | "promote";

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

type Team = {
  id: string;
  name: string;
  shortName: string | null;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  _count?: { players: number };
};

type Season = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  _count?: { matches: number; players: number };
};

type PromotePlayer = {
  id: string;
  firstName: string;
  lastName: string;
  category: string | null;
  suggestedCategory: string | null;
  parent?: { firstName: string; lastName: string; status: string } | null;
};

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [userFilter, setUserFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamForm, setTeamForm] = useState({ name: "", shortName: "", primaryColor: "#1e3a5f" });

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear());

  const [promoteList, setPromoteList] = useState<PromotePlayer[]>([]);
  const [skipIds, setSkipIds] = useState<Set<string>>(new Set());
  const [promoteYear, setPromoteYear] = useState(new Date().getFullYear() + 1);
  const [promoteMsg, setPromoteMsg] = useState("");

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
      loadAll();
    }
  }, [authStatus, session, router]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [u, t, s] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/teams").then((r) => r.json()),
        fetch("/api/admin/seasons").then((r) => r.json()),
      ]);
      if (u.users) setUsers(u.users);
      if (t.teams) setTeams(t.teams);
      if (s.seasons) setSeasons(s.seasons);
    } catch {
      setError("Nepodařilo se načíst data");
    } finally {
      setLoading(false);
    }
  }

  async function loadPromote() {
    setError("");
    try {
      const res = await fetch("/api/admin/season-promote");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setPromoteList(data.players || []);
      setSkipIds(new Set());
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (tab === "promote") loadPromote();
  }, [tab]);

  async function updateUser(userId: string, payload: { status?: string; role?: string }) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...payload }),
    });
    if (!res.ok) {
      setError("Úprava uživatele selhala");
      return;
    }
    await loadAll();
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Vytvoření týmu selhalo");
      return;
    }
    setTeamForm({ name: "", shortName: "", primaryColor: "#1e3a5f" });
    await loadAll();
  }

  async function toggleTeam(id: string, isActive: boolean) {
    await fetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    await loadAll();
  }

  async function createSeason(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: seasonYear, setActive: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Vytvoření sezóny selhalo");
      return;
    }
    await loadAll();
  }

  async function setSeasonActive(id: string) {
    await fetch("/api/admin/seasons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    await loadAll();
  }

  async function runPromote() {
    setError("");
    setPromoteMsg("");
    const promotions = promoteList.map((p) => ({
      playerId: p.id,
      newCategory: p.suggestedCategory || p.category || "U8",
      skip: skipIds.has(p.id) || !p.suggestedCategory || p.suggestedCategory === p.category,
    }));

    const res = await fetch("/api/admin/season-promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: promoteYear,
        seasonName: `Sezóna ${promoteYear}`,
        promotions,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Postup selhal");
      return;
    }
    setPromoteMsg(data.message);
    await loadAll();
    await loadPromote();
  }

  function toggleSkip(id: string) {
    setSkipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredUsers = users.filter((u) =>
    userFilter === "ALL" ? true : u.status === userFilter
  );

  if (authStatus === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">
        Načítám…
      </main>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "users", label: "Uživatelé" },
    { id: "teams", label: "Týmy" },
    { id: "seasons", label: "Sezóny" },
    { id: "promote", label: "Nová sezóna" },
  ];

  return (
    <main className="min-h-screen bg-[#0a1628] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin panel</h1>
            <p className="text-sm text-white/50">Diamond Youth</p>
          </div>
          <div className="flex gap-2">
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

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.id ? "bg-red-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {promoteMsg && (
          <div className="mb-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">{promoteMsg}</div>
        )}

        {tab === "users" && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setUserFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    userFilter === f ? "bg-white/20 text-white" : "bg-white/5 text-white/50"
                  }`}
                >
                  {f === "PENDING" && `Čekající (${users.filter((u) => u.status === "PENDING").length})`}
                  {f === "APPROVED" && "Schválení"}
                  {f === "REJECTED" && "Zamítnutí"}
                  {f === "ALL" && "Všichni"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 && (
                <p className="py-10 text-center text-white/40">Žádní uživatelé</p>
              )}
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-white/50">{user.email}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-2 py-0.5">{user.role}</span>
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
                            .map(
                              (p) =>
                                `${p.firstName} ${p.lastName}${p.category ? ` (${p.category})` : ""}`
                            )
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
                            className="rounded-lg bg-red-600/80 px-3 py-1.5 text-sm font-medium"
                          >
                            Zamítnout
                          </button>
                        </>
                      )}
                      {user.status === "APPROVED" && user.role === "PARENT" && (
                        <button
                          onClick={() => updateUser(user.id, { role: "ORGANIZER" })}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
                        >
                          → Organizátor
                        </button>
                      )}
                      {user.status === "APPROVED" && user.role === "ORGANIZER" && (
                        <button
                          onClick={() => updateUser(user.id, { role: "PARENT" })}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
                        >
                          → Rodič
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "teams" && (
          <>
            <form onSubmit={createTeam} className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white/70">Nový tým</p>
              <input
                value={teamForm.name}
                onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Název (např. Hroši Brno)"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/35"
              />
              <div className="flex gap-3">
                <input
                  value={teamForm.shortName}
                  onChange={(e) => setTeamForm((f) => ({ ...f, shortName: e.target.value }))}
                  placeholder="Zkratka (HRO)"
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/35"
                />
                <input
                  type="color"
                  value={teamForm.primaryColor}
                  onChange={(e) => setTeamForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent"
                  title="Barva týmu"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500"
              >
                Přidat tým
              </button>
            </form>

            <div className="space-y-3">
              {teams.length === 0 && (
                <p className="py-10 text-center text-white/40">Zatím žádné týmy</p>
              )}
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      {(team.shortName || team.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-xs text-white/50">
                        {team.shortName || "—"} · {team._count?.players ?? 0} hráčů
                        {!team.isActive && " · neaktivní"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTeam(team.id, team.isActive)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70"
                  >
                    {team.isActive ? "Deaktivovat" : "Aktivovat"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "seasons" && (
          <>
            <form onSubmit={createSeason} className="mb-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input
                type="number"
                value={seasonYear}
                onChange={(e) => setSeasonYear(parseInt(e.target.value) || 2026)}
                min={2020}
                max={2040}
                className="w-28 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none"
              />
              <button
                type="submit"
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500"
              >
                Vytvořit sezónu (aktivní)
              </button>
            </form>

            <div className="space-y-3">
              {seasons.length === 0 && (
                <p className="py-10 text-center text-white/40">Zatím žádné sezóny</p>
              )}
              {seasons.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {s.name}{" "}
                      {s.isActive && (
                        <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                          aktivní
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/50">Rok {s.year}</p>
                  </div>
                  {!s.isActive && (
                    <button
                      onClick={() => setSeasonActive(s.id)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs"
                    >
                      Nastavit aktivní
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "promote" && (
          <>
            <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80">
              Systém navrhne postup (U8→U9, U9→U10…). U hráčů, kteří mají zůstat, odškrtni postup.
              Po potvrzení se vytvoří nová aktivní sezóna a kategorie se přepíšou.
            </div>

            <div className="mb-4 flex items-center gap-3">
              <label className="text-sm text-white/60">Rok nové sezóny</label>
              <input
                type="number"
                value={promoteYear}
                onChange={(e) => setPromoteYear(parseInt(e.target.value) || 2027)}
                className="w-24 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="mb-4 space-y-2">
              {promoteList.length === 0 && (
                <p className="py-8 text-center text-white/40">Žádní hráči k postupu</p>
              )}
              {promoteList.map((p) => {
                const willPromote =
                  !skipIds.has(p.id) &&
                  !!p.suggestedCategory &&
                  p.suggestedCategory !== p.category;
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={willPromote}
                        onChange={() => toggleSkip(p.id)}
                        className="h-4 w-4 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-white/50">
                          {p.category || "?"} → {p.suggestedCategory || p.category || "?"}
                        </p>
                      </div>
                    </div>
                    {!willPromote && (
                      <span className="text-xs text-white/40">zůstává</span>
                    )}
                  </label>
                );
              })}
            </div>

            <button
              onClick={runPromote}
              disabled={promoteList.length === 0}
              className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-40"
            >
              Spustit postup a novou sezónu
            </button>
          </>
        )}
      </div>
    </main>
  );
}
