import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { firstName, lastName, role } = session.user;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Ahoj,</p>
            <h1 className="text-xl font-bold">
              {firstName} {lastName}
            </h1>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {role === "ADMIN"
              ? "Admin"
              : role === "ORGANIZER"
              ? "Organizator"
              : "Rodic"}
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-slate-800 mb-2">
            Vitejte v aplikaci
          </h2>
          <p className="text-slate-600 text-sm">
            Faze 1 je pripravena. Autentizace, role a zakladni struktura funguji.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-primary">-</p>
            <p className="text-xs text-slate-500 mt-1">Hity</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-primary">-</p>
            <p className="text-xs text-slate-500 mt-1">Dobehy</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-primary">-</p>
            <p className="text-xs text-slate-500 mt-1">Homeruny</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-primary">-</p>
            <p className="text-xs text-slate-500 mt-1">Zapasy</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Stav vyvoje:</strong> Faze 1 dokoncena. Dashboard, statistiky a
          zapis zapasu prijdou v dalsich fazich.
        </div>

        {(role === "ORGANIZER" || role === "ADMIN") && (
          <Link
            href="/matches/new"
            className="block w-full py-3 bg-primary text-white text-center font-semibold rounded-xl"
          >
            Zapisovat zapas
          </Link>
        )}
      </div>
    </main>
  );
}
