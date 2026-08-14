"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { compressImage } from "@/lib/image";

type Child = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  category: string | null;
  jerseyNumber: number | null;
  teams: { team: { id: string; name: string; primaryColor: string } }[];
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [jerseyEdits, setJerseyEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setGreeting(d.user.greeting || "");
          setChildren(d.user.players || []);
          const j: Record<string, string> = {};
          for (const p of d.user.players || []) {
            j[p.id] = p.jerseyNumber != null ? String(p.jerseyNumber) : "";
          }
          setJerseyEdits(j);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function saveGreeting() {
    setErr("");
    setMsg("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ greeting }),
    });
    const d = await res.json();
    if (!res.ok) {
      setErr(d.error || "Chyba");
      return;
    }
    setMsg("Oslovení uloženo");
    await update({ greeting: d.greeting });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newPass !== newPass2) {
      setErr("Nová hesla se neshodují");
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
    });
    const d = await res.json();
    if (!res.ok) {
      setErr(d.error || "Chyba");
      return;
    }
    setMsg("Heslo změněno");
    setCurPass("");
    setNewPass("");
    setNewPass2("");
  }

  async function uploadPhoto(playerId: string, file: File | null) {
    if (!file) return;
    setErr("");
    setMsg("");
    try {
      setMsg("Zmenšuji fotku…");
      const dataUrl = await compressImage(file);
      const res = await fetch(`/api/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: dataUrl }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload selhal");
      setChildren((prev) =>
        prev.map((c) => (c.id === playerId ? { ...c, photoUrl: d.player.photoUrl } : c))
      );
      setMsg("Fotka uložena (automaticky zmenšena)");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Chyba fotky");
      setMsg("");
    }
  }

  async function saveJersey(playerId: string) {
    setErr("");
    setMsg("");
    const raw = jerseyEdits[playerId]?.trim();
    const num = raw === "" || raw == null ? null : parseInt(raw, 10);
    if (num != null && (isNaN(num) || num < 0 || num > 99)) {
      setErr("Číslo dresu 0–99");
      return;
    }
    const res = await fetch(`/api/players/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jerseyNumber: num }),
    });
    const d = await res.json();
    if (!res.ok) {
      setErr(d.error || "Chyba");
      return;
    }
    setChildren((prev) =>
      prev.map((c) => (c.id === playerId ? { ...c, jerseyNumber: d.player.jerseyNumber } : c))
    );
    setMsg("Číslo dresu uloženo");
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center text-white/50">Načítám…</main>
    );
  }

  const user = session?.user as {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    role?: string;
  };

  const roleLabel =
    user?.role === "ADMIN" ? "Administrátor" : user?.role === "ORGANIZER" ? "Organizátor" : "Rodič";

  return (
    <main className="px-4 pt-6">
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-xl font-bold">Nastavení</h1>

        {msg && <div className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{msg}</div>}
        {err && <div className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</div>}

        <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600/30 text-xl font-bold text-sky-300">
              {(user?.firstName || user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "Uživatel"}
              </p>
              <p className="text-sm text-white/45">{user?.email}</p>
              <p className="mt-0.5 text-xs text-sky-400/80">{roleLabel}</p>
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Oslovení na Domů</p>
          <div className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4">
            <p className="mb-2 text-xs text-white/40">Zobrazí se jako „Ahoj, … 👋“ (např. Petře)</p>
            <div className="flex gap-2">
              <input
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder={user?.firstName || "Petře"}
                maxLength={40}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button type="button" onClick={saveGreeting} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold hover:bg-sky-500">
                Uložit
              </button>
            </div>
          </div>
        </section>

        {children.length > 0 && (
          <section className="space-y-2">
            <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Děti – foto a dres</p>
            <div className="space-y-3">
              {children.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-[#0d1b2e] p-4">
                  <div className="flex items-center gap-3">
                    {c.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: c.teams[0]?.team.primaryColor || "#1e3a5f" }}
                      >
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-white/40">
                        {[c.category, c.teams[0]?.team.name].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <label className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5">
                      {c.photoUrl ? "Změnit foto" : "Nahrát foto"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => uploadPhoto(c.id, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-white/40">Číslo dresu</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={jerseyEdits[c.id] ?? ""}
                      onChange={(e) => setJerseyEdits((j) => ({ ...j, [c.id]: e.target.value }))}
                      placeholder="—"
                      className="w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-sm text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveJersey(c.id)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
                    >
                      Uložit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="px-1 text-[11px] text-white/30">Fotku appka sama zmenší – stačí nahrát i velký soubor z telefonu.</p>
          </section>
        )}

        <section className="space-y-2">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">Změna hesla</p>
          <form onSubmit={changePassword} className="space-y-2 rounded-2xl border border-white/10 bg-[#0d1b2e] p-4">
            <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} placeholder="Současné heslo" required className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Nové heslo (min. 6 znaků)" required minLength={6} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <input type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} placeholder="Nové heslo znovu" required minLength={6} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30" />
            <button type="submit" className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold hover:bg-white/15">Změnit heslo</button>
          </form>
        </section>

        {user?.role === "ADMIN" && (
          <Link href="/admin" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium">Admin panel →</Link>
        )}

        <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/20">
          Odhlásit se
        </button>
      </div>
    </main>
  );
}
