"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DemoStatsButton } from "@/components/DemoStatsButton";
import { AdminTeamCard } from "@/components/AdminTeamCard";

type Tab = "users" | "teams" | "seasons" | "promote";
type TeamRef = { id: string; name: string; shortName: string | null; primaryColor?: string };
type Player = {
  id: string;
  firstName: string;
  lastName: string;
  category: string | null;
  teams?: { team: TeamRef }[];
};
type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  canCompare: boolean;
  createdAt: string;
  players: Player[];
};
type Team = {
  id: string;
  name: string;
  shortName: string | null;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  isActive: boolean;
  _count?: { players: number };
};
type Season = { id: string; name: string; year: number; isActive: boolean };
type PromotePlayer = {
  id: string;
  firstName: string;
  lastName: string;
  category: string | null;
  suggestedCategory: string | null;
  teams?: TeamRef[];
};

const CATEGORIES = ["U8", "U9", "U10", "U11", "U12", "U13", "U15", "U18"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 250_000) {
      reject(new Error("Logo max. 250 KB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nelze načíst soubor"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userFilter, setUserFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED">("PENDING");
  const [filterTeam, setFilterTeam] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamForm, setTeamForm] = useState({ name: "", shortName: "", primaryColor: "#1e3a5f", logoUrl: "" });
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear());
  const [promoteList, setPromoteList] = useState<PromotePlayer[]>([]);
  const [skipIds, setSkipIds] = useState<Set<string>>(new Set());
  const [promoteYear, setPromoteYear] = useState(new Date().getFullYear() + 1);
  const [promoteMsg, setPromoteMsg] = useState("");
  const [promoteFilterCategory, setPromoteFilterCategory] = useState("ALL");
  const [promoteFilterTeam, setPromoteFilterTeam] = useState("ALL");

  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/login"); return; }
    if (authStatus === "authenticated") {
      if ((session?.user as { role?: string })?.role !== "ADMIN") { router.push("/dashboard"); return; }
      loadAll();
    }
  }, [authStatus, session, router]);

  async function loadAll() {
    setLoading(true); setError("");
    try {
      const [u, t, s] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/teams").then((r) => r.json()),
        fetch("/api/admin/seasons").then((r) => r.json()),
      ]);
      if (u.users) setUsers(u.users);
      if (t.teams) setTeams(t.teams);
      if (s.seasons) setSeasons(s.seasons);
    } catch { setError("Nepodařilo se načíst data"); }
    finally { setLoading(false); }
  }

  async function loadPromote() {
    setError("");
    try {
      const res = await fetch("/api/admin/season-promote");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setPromoteList(data.players || []);
      setSkipIds(new Set());
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Chyba"); }
  }

  useEffect(() => { if (tab === "promote") loadPromote(); }, [tab]);

  async function updateUser(userId: string, payload: { status?: string; role?: string; canCompare?: boolean }) {
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...payload }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Úprava selhala"); return; }
    await loadAll();
  }

  async function changePlayerTeam(playerId: string, teamId: string) {
    if (!teamId) return;
    setError("");
    const res = await fetch("/api/admin/player-team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, teamId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Změna týmu selhala"); return; }
    await loadAll();
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Opravdu trvale smazat uživatele ${name}? Smažou se i děti a všechna data.`)) return;
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Smazání selhala"); return; }
    await loadAll();
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamForm.name, shortName: teamForm.shortName, primaryColor: teamForm.primaryColor, logoUrl: teamForm.logoUrl || null }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Vytvoření týmu selhala"); return; }
    setTeamForm({ name: "", shortName: "", primaryColor: "#1e3a5f", logoUrl: "" });
    await loadAll();
  }

  async function onLogoFile(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setTeamForm((f) => ({ ...f, logoUrl: dataUrl }));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Chyba loga"); }
  }

  async function createSeason(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: seasonYear, setActive: true }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Vytvoření sezóny selhala"); return; }
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

  const filteredPromote = useMemo(() => promoteList.filter((p) => {
    if (promoteFilterCategory !== "ALL" && p.category !== promoteFilterCategory) return false;
    if (promoteFilterTeam !== "ALL") {
      const ids = (p.teams || []).map((t) => t.id);
      if (!ids.includes(promoteFilterTeam)) return false;
    }
    return true;
  }), [promoteList, promoteFilterCategory, promoteFilterTeam]);

  async function runPromote() {
    setError(""); setPromoteMsg("");
    const promotions = promoteList.map((p) => ({
      playerId: p.id,
      newCategory: p.suggestedCategory || p.category || "U8",
      skip: skipIds.has(p.id) || !p.suggestedCategory || p.suggestedCategory === p.category,
    }));
    const res = await fetch("/api/admin/season-promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: promoteYear, seasonName: `Sezóna ${promoteYear}`, promotions }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Postup selhal"); return; }
    setPromoteMsg(data.message);
    await loadAll();
    await loadPromote();
  }

  function toggleSkip(id: string) {
    setSkipIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function clubsOf(user: UserRow): string {
    const names = new Set<string>();
    for (const p of user.players) for (const t of p.teams || []) names.add(t.team.name);
    return Array.from(names).join(", ") || "—";
  }

  function userMatchesFilters(u: UserRow): boolean {
    if (userFilter !== "ALL" && u.status !== userFilter) return false;
    if (filterTeam !== "ALL") {
      const has = u.players.some((p) => (p.teams || []).some((t) => t.team.id === filterTeam));
      if (!has) return false;
    }
    if (filterCategory !== "ALL") {
      const has = u.players.some((p) => p.category === filterCategory);
      if (!has) return false;
    }
    return true;
  }

  const filteredUsers = users.filter(userMatchesFilters);

  if (authStatus === "loading" || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white/60">Načítám…</main>;
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
            <Link href="/dashboard" className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5">Dashboard</Link>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5">Odhlásit</button>
          </div>
        </div>

        <DemoStatsButton />

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-red-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
        {promoteMsg && <div className="mb-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">{promoteMsg}</div>}

        {tab === "users" && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {(["PENDING", "APPROVED", "SUSPENDED", "REJECTED", "ALL"] as const).map((f) => (
                <button key={f} onClick={() => setUserFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium ${userFilter === f ? "bg-white/20 text-white" : "bg-white/5 text-white/50"}`}>
                  {f === "PENDING" && `Čekající (${users.filter((u) => u.status === "PENDING").length})`}
                  {f === "APPROVED" && "Aktivní"}
                  {f === "SUSPENDED" && "Pozastavení"}
                  {f === "REJECTED" && "Zamítnutí"}
                  {f === "ALL" && "Všichni"}
                </button>
              ))}
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none">
                <option value="ALL" className="bg-[#0a1628]">Všechny týmy</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#0a1628]">{t.name}</option>)}
              </select>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none">
                <option value="ALL" className="bg-[#0a1628]">Všechny kategorie</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {filteredUsers.length === 0 && <p className="py-10 text-center text-white/40">Žádní uživatelé</p>}
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-white/50">{user.email}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white/10 px-2 py-0.5">{user.role}</span>
                        <span className={`rounded-full px-2 py-0.5 ${
                          user.status === "PENDING" ? "bg-amber-500/20 text-amber-300"
                          : user.status === "APPROVED" ? "bg-green-500/20 text-green-300"
                          : user.status === "SUSPENDED" ? "bg-orange-500/20 text-orange-300"
                          : "bg-red-500/20 text-red-300"
                        }`}>{user.status}</span>
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-200">{clubsOf(user)}</span>
                        {user.canCompare && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">Porovnat</span>}
                      </div>

                      {user.players.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {user.players.map((p) => {
                            const currentTeamId = p.teams?.[0]?.team.id || "";
                            return (
                              <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-black/25 px-3 py-2">
                                <span className="text-sm text-white/80">
                                  {p.firstName} {p.lastName}
                                  {p.category ? ` (${p.category})` : ""}
                                </span>
                                <select
                                  value={currentTeamId}
                                  onChange={(e) => changePlayerTeam(p.id, e.target.value)}
                                  className="ml-auto max-w-[220px] rounded-lg border border-white/15 bg-[#0a1628] px-2 py-1.5 text-xs text-white outline-none"
                                >
                                  <option value="" className="bg-[#0a1628]">— vyber tým —</option>
                                  {teams.filter((tm) => tm.isActive).map((tm) => (
                                    <option key={tm.id} value={tm.id} className="bg-[#0a1628]">{tm.name}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.status === "PENDING" && (
                        <>
                          <button onClick={() => updateUser(user.id, { status: "APPROVED" })} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-500">Schválit</button>
                          <button onClick={() => updateUser(user.id, { status: "REJECTED" })} className="rounded-lg bg-red-600/80 px-3 py-1.5 text-sm font-medium">Zamítnout</button>
                        </>
                      )}
                      {user.status === "APPROVED" && user.role !== "ADMIN" && (
                        <>
                          {user.role === "PARENT" && (
                            <button onClick={() => updateUser(user.id, { role: "ORGANIZER" })} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">→ Organizátor</button>
                          )}
                          {user.role === "ORGANIZER" && (
                            <button onClick={() => updateUser(user.id, { role: "PARENT" })} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">→ Rodič</button>
                          )}
                          <button
                            onClick={() => updateUser(user.id, { canCompare: !user.canCompare })}
                            className={`rounded-lg border px-3 py-1.5 text-sm ${user.canCompare ? "border-purple-400/40 text-purple-200" : "border-white/20"}`}
                          >
                            {user.canCompare ? "Porovnat: ANO" : "Porovnat: ne"}
                          </button>
                          <button onClick={() => updateUser(user.id, { status: "SUSPENDED" })} className="rounded-lg border border-orange-400/40 px-3 py-1.5 text-sm text-orange-200">Pozastavit</button>
                        </>
                      )}
                      {user.status === "SUSPENDED" && (
                        <button onClick={() => updateUser(user.id, { status: "APPROVED" })} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium">Obnovit</button>
                      )}
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                        >
                          Smazat
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
              <input value={teamForm.name} onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))} placeholder="Název (např. Hroši Brno)" required className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/35" />
              <div className="flex gap-3">
                <input value={teamForm.shortName} onChange={(e) => setTeamForm((f) => ({ ...f, shortName: e.target.value }))} placeholder="Zkratka (HRO)" className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/35" />
                <input type="color" value={teamForm.primaryColor} onChange={(e) => setTeamForm((f) => ({ ...f, primaryColor: e.target.value }))} className="h-11 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent" title="Barva týmu" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogoFile(e.target.files?.[0] || null)} />
                  {teamForm.logoUrl ? "Logo vybráno" : "Nahrát logo"}
                </label>
                {teamForm.logoUrl && <img src={teamForm.logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />}
              </div>
              <button type="submit" className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500">Přidat tým</button>
            </form>
            <div className="space-y-3">
              {teams.length === 0 && <p className="py-10 text-center text-white/40">Zatím žádné týmy</p>}
              {teams.map((team) => (
                <AdminTeamCard key={team.id} team={team} onUpdated={loadAll} onError={setError} />
              ))}
            </div>
          </>
        )}

        {tab === "seasons" && (
          <>
            <form onSubmit={createSeason} className="mb-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input type="number" value={seasonYear} onChange={(e) => setSeasonYear(parseInt(e.target.value) || 2026)} min={2020} max={2040} className="w-28 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white outline-none" />
              <button type="submit" className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold hover:bg-red-500">Vytvořit sezónu (aktivní)</button>
            </form>
            <div className="space-y-3">
              {seasons.length === 0 && <p className="py-10 text-center text-white/40">Zatím žádné sezóny</p>}
              {seasons.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <p className="font-semibold">{s.name} {s.isActive && <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">aktivní</span>}</p>
                    <p className="text-xs text-white/50">Rok {s.year}</p>
                  </div>
                  {!s.isActive && <button onClick={() => setSeasonActive(s.id)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs">Nastavit aktivní</button>}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "promote" && (
          <>
            <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/80">Systém navrhne postup (U8→U9…). Odškrtni hráče, kteří zůstávají.</div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/60">Rok</label>
                <input type="number" value={promoteYear} onChange={(e) => setPromoteYear(parseInt(e.target.value) || 2027)} className="w-24 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white outline-none" />
              </div>
              <select value={promoteFilterCategory} onChange={(e) => setPromoteFilterCategory(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                <option value="ALL" className="bg-[#0a1628]">Všechny kategorie</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a1628]">{c}</option>)}
              </select>
              <select value={promoteFilterTeam} onChange={(e) => setPromoteFilterTeam(e.target.value)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                <option value="ALL" className="bg-[#0a1628]">Všechny týmy</option>
                {teams.map((t) => <option key={t.id} value={t.id} className="bg-[#0a1628]">{t.name}</option>)}
              </select>
            </div>
            <div className="mb-4 space-y-2">
              {filteredPromote.length === 0 && <p className="py-8 text-center text-white/40">Žádní hráči</p>}
              {filteredPromote.map((p) => {
                const willPromote = !skipIds.has(p.id) && !!p.suggestedCategory && p.suggestedCategory !== p.category;
                const teamLabel = (p.teams || []).map((t) => t.name).join(", ") || "—";
                return (
                  <label key={p.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={willPromote} onChange={() => toggleSkip(p.id)} className="h-4 w-4 rounded" />
                      <div>
                        <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-white/50">{p.category || "?"} → {p.suggestedCategory || p.category || "?"} · {teamLabel}</p>
                      </div>
                    </div>
                    {!willPromote && <span className="text-xs text-white/40">zůstává</span>}
                  </label>
                );
              })}
            </div>
            <button onClick={runPromote} disabled={promoteList.length === 0} className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-40">Spustit postup a novou sezónu</button>
          </>
        )}
      </div>
    </main>
  );
}
