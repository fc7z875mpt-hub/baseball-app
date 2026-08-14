import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateStats } from "@/lib/stats";

/**
 * Porovnání hráče:
 *  scope=team     → vlastní tým (průměr + nejlepší)
 *  scope=allstar  → všichni v kategorii/ročníku napříč týmy
 *  scope=other    → konkrétní tým (?teamId=)
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    const canCompare =
      (session.user as { canCompare?: boolean }).canCompare ||
      role === "ORGANIZER" ||
      role === "ADMIN";

    if (!canCompare) {
      return NextResponse.json({ error: "Porovnání není povoleno" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const scopeParam = req.nextUrl.searchParams.get("scope") || "team";
    // zpětná kompatibilita: category → allstar
    const scope =
      scopeParam === "category" ? "allstar" : (scopeParam as "team" | "allstar" | "other");
    const otherTeamId = req.nextUrl.searchParams.get("teamId");

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        teams: {
          where: { isActive: true },
          include: { team: true },
        },
        stats: true,
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Hráč nenalezen" }, { status: 404 });
    }

    const myStats = aggregateStats(player.stats);
    const ownTeamId = player.teams[0]?.teamId || null;
    const ownTeamName = player.teams[0]?.team.name || null;
    const category = player.category;

    // Seznam týmů pro picker (jiný tým)
    const allTeams = await prisma.team.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, shortName: true },
    });

    let whereClause: Record<string, unknown> = { id: { not: id } };
    let scopeLabel = "Tým";
    let compareTeamName: string | null = ownTeamName;

    if (scope === "team") {
      if (!ownTeamId) {
        return NextResponse.json({
          scope: "team",
          scopeLabel: "Vlastní tým",
          me: statsPayload(myStats),
          average: emptyAgg(),
          best: null,
          peerCount: 0,
          teams: allTeams,
          ownTeamId,
          compareTeamName: ownTeamName,
        });
      }
      whereClause = {
        id: { not: id },
        teams: { some: { teamId: ownTeamId, isActive: true } },
      };
      scopeLabel = "Vlastní tým";
      compareTeamName = ownTeamName;
    } else if (scope === "allstar") {
      if (!category) {
        return NextResponse.json({
          scope: "allstar",
          scopeLabel: "All-star (ročník)",
          me: statsPayload(myStats),
          average: emptyAgg(),
          best: null,
          peerCount: 0,
          teams: allTeams,
          ownTeamId,
          compareTeamName: category || null,
          error: "Hráč nemá nastavenou kategorii",
        });
      }
      whereClause = {
        id: { not: id },
        category,
      };
      scopeLabel = `All-star · ${category}`;
      compareTeamName = category;
    } else if (scope === "other") {
      if (!otherTeamId) {
        return NextResponse.json({
          scope: "other",
          scopeLabel: "Jiný tým",
          me: statsPayload(myStats),
          average: emptyAgg(),
          best: null,
          peerCount: 0,
          teams: allTeams.filter((t) => t.id !== ownTeamId),
          ownTeamId,
          compareTeamName: null,
          needsTeamId: true,
        });
      }
      const target = allTeams.find((t) => t.id === otherTeamId);
      whereClause = {
        id: { not: id },
        teams: { some: { teamId: otherTeamId, isActive: true } },
      };
      // pokud je vybraný tým a hráč má kategorii, omez i na stejný ročník
      if (category) {
        whereClause = {
          ...whereClause,
          category,
        };
      }
      scopeLabel = target ? target.name : "Jiný tým";
      compareTeamName = target?.name || null;
    }

    let peers = await prisma.player.findMany({
      where: whereClause,
      include: { stats: true },
    });

    peers = peers.filter((p) => p.stats.length > 0);

    const peerAggs = peers.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      stats: aggregateStats(p.stats),
    }));

    const n = peerAggs.length;
    const average =
      n === 0
        ? emptyAgg()
        : {
            hits: Math.round(peerAggs.reduce((s, p) => s + p.stats.hits, 0) / n),
            runs: Math.round(peerAggs.reduce((s, p) => s + p.stats.runs, 0) / n),
            homeRuns: Math.round(peerAggs.reduce((s, p) => s + p.stats.homeRuns, 0) / n),
            games: Math.round(peerAggs.reduce((s, p) => s + p.stats.games, 0) / n),
            avg:
              peerAggs.reduce((s, p) => s + (p.stats.avg ?? 0), 0) /
              (peerAggs.filter((p) => p.stats.avg != null).length || 1),
          };

    const best =
      peerAggs.length > 0
        ? peerAggs.reduce((a, b) => (b.stats.hits > a.stats.hits ? b : a))
        : null;

    return NextResponse.json({
      scope,
      scopeLabel,
      me: statsPayload(myStats),
      average,
      // zpětná kompatibilita se starým UI
      teamAverage: average,
      best: best
        ? {
            name: best.name,
            hits: best.stats.hits,
            runs: best.stats.runs,
            homeRuns: best.stats.homeRuns,
            games: best.stats.games,
            avg: best.stats.avg,
          }
        : null,
      peerCount: peerAggs.length,
      teams: allTeams.filter((t) => t.id !== ownTeamId),
      ownTeamId,
      compareTeamName,
      category,
      otherTeamId: otherTeamId || null,
    });
  } catch (error) {
    console.error("compare:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

function statsPayload(s: {
  hits: number;
  runs: number;
  homeRuns: number;
  games: number;
  avg: number | null;
}) {
  return {
    hits: s.hits,
    runs: s.runs,
    homeRuns: s.homeRuns,
    games: s.games,
    avg: s.avg,
  };
}

function emptyAgg() {
  return { hits: 0, runs: 0, homeRuns: 0, games: 0, avg: 0 };
}
