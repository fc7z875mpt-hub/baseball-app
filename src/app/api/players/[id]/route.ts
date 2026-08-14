import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateStats } from "@/lib/stats";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const userId = (session.user as { id?: string }).id;
    const role = (session.user as { role?: string }).role;

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, firstName: true, lastName: true },
        },
        teams: {
          where: { isActive: true },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
                primaryColor: true,
                secondaryColor: true,
                logoUrl: true,
              },
            },
            season: { select: { id: true, name: true, year: true, isActive: true } },
          },
        },
        stats: {
          include: {
            match: {
              select: {
                id: true,
                date: true,
                homeScore: true,
                awayScore: true,
                awayTeamName: true,
                status: true,
                homeTeam: { select: { name: true, shortName: true } },
              },
            },
          },
          orderBy: { match: { date: "desc" } },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Hráč nenalezen" }, { status: 404 });
    }

    // RBAC: rodič jen své dítě, admin/org vše
    const isStaff = role === "ADMIN" || role === "ORGANIZER";
    if (!isStaff && player.parentId !== userId) {
      return NextResponse.json({ error: "Nemáte přístup" }, { status: 403 });
    }

    const aggregated = aggregateStats(player.stats);

    // Posledních 8 zápasů pro graf trendu
    const recent = [...player.stats]
      .sort(
        (a, b) =>
          new Date(a.match.date).getTime() - new Date(b.match.date).getTime()
      )
      .slice(-8)
      .map((s) => ({
        matchId: s.matchId,
        date: s.match.date,
        opponent:
          s.match.awayTeamName ||
          s.match.homeTeam?.shortName ||
          s.match.homeTeam?.name ||
          "–",
        hits: s.hits,
        atBats: s.atBats,
        runs: s.runs,
        homeRuns: s.homeRuns,
        errors: s.errors,
        result: `${s.match.homeScore}:${s.match.awayScore}`,
      }));

    return NextResponse.json({
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        jerseyNumber: player.jerseyNumber,
        photoUrl: player.photoUrl,
        birthYear: player.birthYear,
        category: player.category,
        parent: player.parent,
        teams: player.teams.map((t) => ({
          team: t.team,
          season: t.season,
        })),
      },
      stats: aggregated,
      recentGames: recent,
    });
  } catch (error) {
    console.error("players/[id]:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
