import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Admin-only: vytvoří ukázkové zápasy + statistiky pro existující hráče,
 * aby šlo otestovat profil a grafy.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Jen admin" }, { status: 403 });
    }

    const team = await prisma.team.findFirst({ where: { isActive: true } });
    if (!team) {
      return NextResponse.json(
        { error: "Nejdřív vytvoř tým (seed nebo admin)" },
        { status: 400 }
      );
    }

    const season =
      (await prisma.season.findFirst({ where: { isActive: true } })) ||
      (await prisma.season.create({
        data: { name: "Sezóna 2026", year: 2026, isActive: true },
      }));

    const players = await prisma.player.findMany({ take: 20 });
    if (players.length === 0) {
      return NextResponse.json(
        { error: "Žádní hráči – nejdřív registrace + schválení" },
        { status: 400 }
      );
    }

    // Přiřaď hráče k týmu pokud nemají
    for (const p of players) {
      const link = await prisma.playerTeam.findFirst({
        where: { playerId: p.id, teamId: team.id },
      });
      if (!link) {
        await prisma.playerTeam.create({
          data: {
            playerId: p.id,
            teamId: team.id,
            seasonId: season.id,
            isActive: true,
          },
        });
      }
    }

    const opponents = [
      "Sokol Praha",
      "Olympia Plzeň",
      "Tempo Liberec",
      "Arrows Ostrava",
      "Kotlářka Praha",
      "Technika Brno",
      "Eagles Praha",
      "Skokani Olomouc",
    ];

    let matchesCreated = 0;
    let statsCreated = 0;

    for (let i = 0; i < opponents.length; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (opponents.length - i) * 7);

      const existing = await prisma.match.findFirst({
        where: {
          homeTeamId: team.id,
          awayTeamName: opponents[i],
          seasonId: season.id,
        },
      });

      let match = existing;
      if (!match) {
        const homeScore = 3 + Math.floor(Math.random() * 8);
        const awayScore = 1 + Math.floor(Math.random() * 7);
        match = await prisma.match.create({
          data: {
            date,
            location: "Brno – Hroší park",
            homeTeamId: team.id,
            awayTeamName: opponents[i],
            homeScore,
            awayScore,
            status: "FINISHED",
            seasonId: season.id,
            isHome: true,
          },
        });
        matchesCreated++;
      }

      for (const p of players) {
        const has = await prisma.playerMatchStat.findUnique({
          where: {
            matchId_playerId: { matchId: match.id, playerId: p.id },
          },
        });
        if (has) continue;

        const atBats = 2 + Math.floor(Math.random() * 3);
        const hits = Math.min(atBats, Math.floor(Math.random() * 3));
        const homeRuns = hits > 0 && Math.random() > 0.85 ? 1 : 0;
        const doubles = hits > homeRuns && Math.random() > 0.7 ? 1 : 0;
        const triples = 0;
        const singles = Math.max(0, hits - homeRuns - doubles - triples);
        const walks = Math.random() > 0.7 ? 1 : 0;
        const runs = hits > 0 ? Math.floor(Math.random() * (hits + 1)) : 0;
        const rbi = homeRuns + (hits > 0 && Math.random() > 0.5 ? 1 : 0);
        const errors = Math.random() > 0.85 ? 1 : 0;

        await prisma.playerMatchStat.create({
          data: {
            matchId: match.id,
            playerId: p.id,
            teamId: team.id,
            atBats,
            hits,
            singles,
            doubles,
            triples,
            homeRuns,
            runs,
            rbi,
            walks,
            strikeouts: Math.max(0, atBats - hits - (Math.random() > 0.5 ? 1 : 0)),
            errors,
            putouts: Math.floor(Math.random() * 4),
            assists: Math.floor(Math.random() * 3),
            inningsInField: 4 + Math.floor(Math.random() * 3),
          },
        });
        statsCreated++;
      }
    }

    return NextResponse.json({
      message: "Demo statistiky připraveny",
      matchesCreated,
      statsCreated,
      players: players.length,
      team: team.name,
      season: season.name,
    });
  } catch (error) {
    console.error("setup-demo-stats:", error);
    return NextResponse.json({ error: "Seed selhal" }, { status: 500 });
  }
}
