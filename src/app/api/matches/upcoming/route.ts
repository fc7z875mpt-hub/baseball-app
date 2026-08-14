import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Nejbližší zápasy pro dashboard (max 5) */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const now = new Date();
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { status: "SCHEDULED", date: { gte: new Date(now.getTime() - 86400000) } },
          { status: "LIVE" },
          {
            status: "FINISHED",
            date: { gte: new Date(now.getTime() - 7 * 86400000) },
          },
        ],
      },
      orderBy: [{ status: "asc" }, { date: "asc" }],
      take: 8,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            primaryColor: true,
            logoUrl: true,
          },
        },
      },
    });

    // LIVE first, then SCHEDULED by date, then recent FINISHED
    const rank = (s: string) => (s === "LIVE" ? 0 : s === "SCHEDULED" ? 1 : 2);
    matches.sort((a, b) => {
      const r = rank(a.status) - rank(b.status);
      if (r !== 0) return r;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return NextResponse.json({
      matches: matches.slice(0, 5).map((m) => ({
        id: m.id,
        date: m.date,
        time: m.time,
        location: m.location,
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        opponent: m.awayTeamName || m.awayTeam?.name || "Soupeř",
        isHome: m.isHome,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}
