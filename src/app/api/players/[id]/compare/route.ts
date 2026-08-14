import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateStats } from "@/lib/stats";

/**
 * Porovnání hráče s průměrem a nejlepším z týmu / kategorie.
 * Přístupné jen s canCompare (admin udělí) nebo ORGANIZER/ADMIN.
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
      return NextResponse.json(
        { error: "Porovnání není povoleno" },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    const scope = req.nextUrl.searchParams.get("scope") || "team"; // team | category

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
    const teamId = player.teams[0]?.teamId;
    const category = player.category;

    // Najít peer hráče
    let peers = await prisma.player.findMany({
      where:
        scope === "category" && category
          ? { category, id: { not: id } }
          : teamId
            ? {
                id: { not: id },
                teams: { some: { teamId, isActive: true } },
              }
            : { id: { not: id } },
      include: { stats: true },
    });

    // Omezit na hráče se statistikami
    peers = peers.filter((p) => p.stats.length > 0);

    const peerAggs = peers.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      stats: aggregateStats(p.stats),
    }));

    // Průměr týmu/kategorie
    const n = peerAggs.length || 1;
    const avg = {
      hits: Math.round(peerAggs.reduce((s, p) => s + p.stats.hits, 0) / n),
      runs: Math.round(peerAggs.reduce((s, p) => s + p.stats.runs, 0) / n),
      homeRuns: Math.round(
        peerAggs.reduce((s, p) => s + p.stats.homeRuns, 0) / n
      ),
      games: Math.round(peerAggs.reduce((s, p) => s + p.stats.games, 0) / n),
      avg:
        peerAggs.reduce((s, p) => s + (p.stats.avg ?? 0), 0) /
        (peerAggs.filter((p) => p.stats.avg != null).length || 1),
    };

    // Nejlepší podle hitů
    const best =
      peerAggs.length > 0
        ? peerAggs.reduce((a, b) => (b.stats.hits > a.stats.hits ? b : a))
        : null;

    return NextResponse.json({
      scope,
      me: {
        hits: myStats.hits,
        runs: myStats.runs,
        homeRuns: myStats.homeRuns,
        games: myStats.games,
        avg: myStats.avg,
      },
      teamAverage: avg,
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
    });
  } catch (error) {
    console.error("compare:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
