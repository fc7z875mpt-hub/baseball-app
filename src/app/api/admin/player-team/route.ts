import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/** Admin: přiřadit / změnit tým hráče (dítěte uživatele) */
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { playerId, teamId } = body as { playerId?: string; teamId?: string };

  if (!playerId || !teamId) {
    return NextResponse.json(
      { error: "Chybí playerId nebo teamId" },
      { status: 400 }
    );
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) {
    return NextResponse.json({ error: "Hráč nenalezen" }, { status: 404 });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || !team.isActive) {
    return NextResponse.json({ error: "Tým nenalezen" }, { status: 404 });
  }

  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  // Deaktivovat stávající aktivní vazby
  await prisma.playerTeam.updateMany({
    where: { playerId, isActive: true },
    data: { isActive: false },
  });

  // Najít nebo vytvořit vazbu na nový tým
  const existing = await prisma.playerTeam.findFirst({
    where: {
      playerId,
      teamId,
      seasonId: activeSeason?.id ?? null,
    },
  });

  if (existing) {
    await prisma.playerTeam.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
  } else {
    await prisma.playerTeam.create({
      data: {
        playerId,
        teamId,
        seasonId: activeSeason?.id ?? null,
        isActive: true,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    message: `${player.firstName} ${player.lastName} → ${team.name}`,
  });
}
