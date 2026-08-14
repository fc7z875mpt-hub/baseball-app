import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateStats } from "@/lib/stats";

/** Děti přihlášeného rodiče + agregované statistiky */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const role = (session.user as { role?: string }).role;

    if (!userId) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    // Admin/organizátor může vidět všechny hráče (pro přehled), rodič jen své děti
    const where =
      role === "ADMIN" || role === "ORGANIZER"
        ? {}
        : { parentId: userId };

    const players = await prisma.player.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        teams: {
          where: { isActive: true },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                primaryColor: true,
                logoUrl: true,
              },
            },
            season: { select: { id: true, name: true, year: true } },
          },
        },
        stats: {
          select: {
            atBats: true,
            hits: true,
            singles: true,
            doubles: true,
            triples: true,
            homeRuns: true,
            runs: true,
            rbi: true,
            walks: true,
            strikeouts: true,
            errors: true,
            putouts: true,
            assists: true,
            inningsInField: true,
          },
        },
      },
    });

    // Rodič bez dětí – prázdný seznam (ne chyba)
    const result = players.map((p) => {
      const aggregated = aggregateStats(p.stats);
      const primaryTeam = p.teams[0]?.team ?? null;
      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        jerseyNumber: p.jerseyNumber,
        photoUrl: p.photoUrl,
        birthYear: p.birthYear,
        category: p.category,
        team: primaryTeam,
        teams: p.teams.map((t) => ({
          team: t.team,
          season: t.season,
        })),
        stats: aggregated,
      };
    });

    return NextResponse.json({ players: result });
  } catch (error) {
    console.error("players/me:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
