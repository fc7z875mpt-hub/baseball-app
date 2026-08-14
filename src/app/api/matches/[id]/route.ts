import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isStaff } from "@/lib/match-access";

const teamSelect = {
  id: true,
  name: true,
  shortName: true,
  primaryColor: true,
  logoUrl: true,
} as const;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: teamSelect },
        awayTeam: { select: teamSelect },
        season: { select: { id: true, name: true, year: true } },
        playerStats: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                jerseyNumber: true,
              },
            },
          },
          orderBy: [{ player: { lastName: "asc" } }],
        },
        lineups: true,
        innings: { orderBy: [{ number: "asc" }, { isTop: "desc" }] },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Zápas nenalezen" }, { status: 404 });
    }

    // Hráči domácího týmu pro sestavu / zápis
    const roster = await prisma.player.findMany({
      where: {
        teams: { some: { teamId: match.homeTeamId, isActive: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jerseyNumber: true,
        category: true,
      },
    });

    return NextResponse.json({
      match: {
        id: match.id,
        date: match.date,
        time: match.time,
        location: match.location,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        opponent: match.awayTeamName || match.awayTeam?.name || "Soupeř",
        isHome: match.isHome,
        season: match.season,
        playerStats: match.playerStats.map((s) => ({
          playerId: s.playerId,
          player: s.player,
          atBats: s.atBats,
          hits: s.hits,
          singles: s.singles,
          doubles: s.doubles,
          triples: s.triples,
          homeRuns: s.homeRuns,
          runs: s.runs,
          rbi: s.rbi,
          walks: s.walks,
          strikeouts: s.strikeouts,
          errors: s.errors,
          putouts: s.putouts,
          assists: s.assists,
          inningsInField: s.inningsInField,
        })),
        lineups: match.lineups,
        innings: match.innings,
      },
      roster,
      canEdit: isStaff(session),
    });
  } catch (e) {
    console.error("match GET:", e);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

/** Aktualizace zápasu – skóre, status, metadata */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session || !isStaff(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.homeScore === "number") data.homeScore = Math.max(0, body.homeScore);
    if (typeof body.awayScore === "number") data.awayScore = Math.max(0, body.awayScore);
    if (body.status && ["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"].includes(body.status)) {
      data.status = body.status;
    }
    if (body.location !== undefined) data.location = body.location;
    if (body.time !== undefined) data.time = body.time;

    const match = await prisma.match.update({
      where: { id },
      data,
      include: {
        homeTeam: { select: teamSelect },
        awayTeam: { select: teamSelect },
      },
    });

    return NextResponse.json({
      match: {
        id: match.id,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        opponent: match.awayTeamName || match.awayTeam?.name || "Soupeř",
      },
    });
  } catch (e) {
    console.error("match PATCH:", e);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
