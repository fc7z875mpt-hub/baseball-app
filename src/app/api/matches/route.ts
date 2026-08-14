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

/** Seznam zápasů */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get("status"); // SCHEDULED|LIVE|FINISHED|ALL
    const take = Math.min(Number(req.nextUrl.searchParams.get("take") || 50), 100);

    const where =
      status && status !== "ALL"
        ? { status: status as "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED" }
        : {};

    const matches = await prisma.match.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take,
      include: {
        homeTeam: { select: teamSelect },
        awayTeam: { select: teamSelect },
        season: { select: { id: true, name: true, year: true } },
        _count: { select: { playerStats: true } },
      },
    });

    return NextResponse.json({
      matches: matches.map((m) => ({
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
        season: m.season,
        statsCount: m._count.playerStats,
      })),
    });
  } catch (e) {
    console.error("matches GET:", e);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

/** Vytvoření zápasu – ORGANIZER / ADMIN */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (!session || !isStaff(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      date,
      time,
      location,
      homeTeamId,
      awayTeamId,
      awayTeamName,
      seasonId,
      isHome = true,
    } = body as {
      date?: string;
      time?: string;
      location?: string;
      homeTeamId?: string;
      awayTeamId?: string;
      awayTeamName?: string;
      seasonId?: string;
      isHome?: boolean;
    };

    if (!date || !homeTeamId) {
      return NextResponse.json(
        { error: "Datum a domácí tým jsou povinné" },
        { status: 400 }
      );
    }

    if (!awayTeamId && !awayTeamName?.trim()) {
      return NextResponse.json(
        { error: "Zadej soupeře (tým nebo název)" },
        { status: 400 }
      );
    }

    const home = await prisma.team.findUnique({ where: { id: homeTeamId } });
    if (!home) {
      return NextResponse.json({ error: "Domácí tým neexistuje" }, { status: 400 });
    }

    if (awayTeamId) {
      const away = await prisma.team.findUnique({ where: { id: awayTeamId } });
      if (!away) {
        return NextResponse.json({ error: "Hostující tým neexistuje" }, { status: 400 });
      }
    }

    let resolvedSeasonId = seasonId || null;
    if (!resolvedSeasonId) {
      const active = await prisma.season.findFirst({
        where: { isActive: true },
        orderBy: { year: "desc" },
      });
      resolvedSeasonId = active?.id || null;
    }

    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        time: time?.trim() || null,
        location: location?.trim() || null,
        homeTeamId,
        awayTeamId: awayTeamId || null,
        awayTeamName: awayTeamId ? null : awayTeamName?.trim() || null,
        seasonId: resolvedSeasonId,
        isHome: !!isHome,
        status: "SCHEDULED",
      },
      include: {
        homeTeam: { select: teamSelect },
        awayTeam: { select: teamSelect },
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
      },
    });
  } catch (e) {
    console.error("matches POST:", e);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
