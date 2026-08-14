import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, isStaff } from "@/lib/match-access";

type StatInput = {
  playerId: string;
  atBats?: number;
  hits?: number;
  singles?: number;
  doubles?: number;
  triples?: number;
  homeRuns?: number;
  runs?: number;
  rbi?: number;
  walks?: number;
  strikeouts?: number;
  errors?: number;
  putouts?: number;
  assists?: number;
  inningsInField?: number;
};

/**
 * Uložení statistik hráčů ze zápasu (+ volitelně skóre / status).
 * Základní mobilní zápis: dávka statistik najednou.
 */
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    if (!session || !isStaff(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: matchId } = await ctx.params;
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Zápas nenalezen" }, { status: 404 });
    }

    const body = await req.json();
    const stats = (body.stats || []) as StatInput[];
    const homeScore =
      typeof body.homeScore === "number" ? Math.max(0, body.homeScore) : undefined;
    const awayScore =
      typeof body.awayScore === "number" ? Math.max(0, body.awayScore) : undefined;
    const status = body.status as string | undefined;

    if (!Array.isArray(stats)) {
      return NextResponse.json({ error: "stats musí být pole" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const s of stats) {
        if (!s.playerId) continue;

        const atBats = Math.max(0, s.atBats ?? 0);
        const homeRuns = Math.max(0, s.homeRuns ?? 0);
        const doubles = Math.max(0, s.doubles ?? 0);
        const triples = Math.max(0, s.triples ?? 0);
        const singles = Math.max(
          0,
          s.singles ?? Math.max(0, (s.hits ?? 0) - homeRuns - doubles - triples)
        );
        const hits = Math.max(
          0,
          s.hits ?? singles + doubles + triples + homeRuns
        );

        await tx.playerMatchStat.upsert({
          where: {
            matchId_playerId: { matchId, playerId: s.playerId },
          },
          create: {
            matchId,
            playerId: s.playerId,
            teamId: match.homeTeamId,
            atBats,
            hits,
            singles,
            doubles,
            triples,
            homeRuns,
            runs: Math.max(0, s.runs ?? 0),
            rbi: Math.max(0, s.rbi ?? 0),
            walks: Math.max(0, s.walks ?? 0),
            strikeouts: Math.max(0, s.strikeouts ?? 0),
            errors: Math.max(0, s.errors ?? 0),
            putouts: Math.max(0, s.putouts ?? 0),
            assists: Math.max(0, s.assists ?? 0),
            inningsInField: Math.max(0, s.inningsInField ?? 0),
          },
          update: {
            atBats,
            hits,
            singles,
            doubles,
            triples,
            homeRuns,
            runs: Math.max(0, s.runs ?? 0),
            rbi: Math.max(0, s.rbi ?? 0),
            walks: Math.max(0, s.walks ?? 0),
            strikeouts: Math.max(0, s.strikeouts ?? 0),
            errors: Math.max(0, s.errors ?? 0),
            putouts: Math.max(0, s.putouts ?? 0),
            assists: Math.max(0, s.assists ?? 0),
            inningsInField: Math.max(0, s.inningsInField ?? 0),
          },
        });
      }

      const matchData: Record<string, unknown> = {};
      if (homeScore !== undefined) matchData.homeScore = homeScore;
      if (awayScore !== undefined) matchData.awayScore = awayScore;
      if (status && ["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"].includes(status)) {
        matchData.status = status;
      }
      if (Object.keys(matchData).length) {
        await tx.match.update({ where: { id: matchId }, data: matchData });
      }
    });

    const updated = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
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
        },
      },
    });

    return NextResponse.json({
      ok: true,
      homeScore: updated?.homeScore,
      awayScore: updated?.awayScore,
      status: updated?.status,
      playerStats: updated?.playerStats || [],
    });
  } catch (e) {
    console.error("match stats PUT:", e);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
