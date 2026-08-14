"use client";

import { useState } from "react";

type Team = {
  id: string;
  name: string;
  shortName: string | null;
  primaryColor: string;
  logoUrl: string | null;
  isActive: boolean;
  _count?: { players: number };
};

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

export function AdminTeamCard({
  team,
  onUpdated,
  onError,
}: {
  team: Team;
  onUpdated: () => void;
  onError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [shortName, setShortName] = useState(team.shortName || "");
  const [primaryColor, setPrimaryColor] = useState(team.primaryColor);
  const [logoUrl, setLogoUrl] = useState(team.logoUrl || "");
  const [saving, setSaving] = useState(false);

  function openEdit() {
    setName(team.name);
    setShortName(team.shortName || "");
    setPrimaryColor(team.primaryColor);
    setLogoUrl(team.logoUrl || "");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: team.id,
          name,
          shortName,
          primaryColor,
          logoUrl: logoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Úprava selhala");
      setEditing(false);
      onUpdated();
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : "Chyba");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    await fetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: team.id, isActive: !team.isActive }),
    });
    onUpdated();
  }

  async function onLogo(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoUrl(dataUrl);
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : "Chyba loga");
    }
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded-2xl border border-sky-500/30 bg-white/5 p-4">
        <p className="text-sm font-semibold text-sky-300">Upravit tým</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Název klubu"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
        <div className="flex gap-2">
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Zkratka"
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          />
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-white/15 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-white/60 hover:bg-white/5">
            Změnit logo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => onLogo(e.target.files?.[0] || null)}
            />
          </label>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="flex-1 rounded-xl bg-sky-600 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/60"
          >
            Zrušit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex min-w-0 items-center gap-3">
        {team.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.logoUrl} alt={team.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: team.primaryColor }}
          >
            {(team.shortName || team.name).slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{team.name}</p>
          <p className="text-xs text-white/50">
            {team.shortName || "—"} · {team._count?.players ?? 0} hráčů
            {!team.isActive && " · neaktivní"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={openEdit}
          className="rounded-lg border border-sky-500/30 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-500/10"
        >
          Upravit
        </button>
        <button
          type="button"
          onClick={toggleActive}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70"
        >
          {team.isActive ? "Deaktivovat" : "Aktivovat"}
        </button>
      </div>
    </div>
  );
}
