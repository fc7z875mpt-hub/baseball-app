import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const players = await prisma.player.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      parent: {
        select: { id: true, firstName: true, lastName: true, email: true, status: true },
      },
      teams: {
        where: { isActive: true },
        include: {
          team: { select: { id: true, name: true, shortName: true } },
          season: { select: { id: true, name: true, year: true } },
        },
      },
    },
  });

  return NextResponse.json({ players });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { playerId, category, teamId, seasonId, action } = body as {
    playerId: string;
    category?: string;
    teamId?: string;
    seasonId?: string;
    action?: "assignTeam" | "removeTeam" | "updateCategory";
  };

  if (!playerId) {
    return NextResponse.json({ error: "Chybí playerId" }, { status: 400 });
  }

  if (action === "updateCategory" || category) {
    if (!category) {
      return NextResponse.json({ error: "Chybí kategorie" }, { status: 400 });
    }
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { category },
    });
    return NextResponse.json({ player });
  }

  if (action === "assignTeam") {
    if (!teamId) {
      return NextResponse.json({ error: "Chybí teamId" }, { status: 400 });
    }

    // deactivate previous links for same team+season if needed, then create
    const link = await prisma.playerTeam.upsert({
      where: {
        playerId_teamId_seasonId: {
          playerId,
          teamId,
          seasonId: seasonId || "",
        },
      },
      create: {
        playerId,
        teamId,
        seasonId: seasonId || null,
        isActive: true,
      },
      update: {
        isActive: true,
      },
    }).catch(async () => {
      // unique constraint with null seasonId can be tricky – fallback create
      return prisma.playerTeam.create({
        data: {
          playerId,
          teamId,
          seasonId: seasonId || null,
          isActive: true,
        },
      });
    });

    return NextResponse.json({ link });
  }

  if (action === "removeTeam") {
    if (!teamId) {
      return NextResponse.json({ error: "Chybí teamId" }, { status: 400 });
    }
    await prisma.playerTeam.updateMany({
      where: { playerId, teamId, isActive: true },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Neplatná akce" }, { status: 400 });
}
