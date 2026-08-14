import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, nextCategory } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const players = await prisma.player.findMany({
    orderBy: [{ category: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      category: true,
      parent: { select: { firstName: true, lastName: true, status: true } },
      teams: {
        where: { isActive: true },
        select: {
          team: {
            select: { id: true, name: true, shortName: true },
          },
        },
      },
    },
  });

  const preview = players.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    category: p.category,
    suggestedCategory: nextCategory(p.category),
    parent: p.parent,
    teams: p.teams.map((t) => t.team),
  }));

  return NextResponse.json({ players: preview });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { year, seasonName, promotions } = body as {
    year: number;
    seasonName?: string;
    promotions: { playerId: string; newCategory: string; skip?: boolean }[];
  };

  if (!year || !Array.isArray(promotions)) {
    return NextResponse.json({ error: "Chybí year nebo promotions" }, { status: 400 });
  }

  await prisma.season.updateMany({ data: { isActive: false } });

  const season = await prisma.season.create({
    data: {
      name: seasonName?.trim() || `Sezóna ${year}`,
      year,
      isActive: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const item of promotions) {
    if (item.skip || !item.newCategory) {
      skipped++;
      continue;
    }
    await prisma.player.update({
      where: { id: item.playerId },
      data: { category: item.newCategory },
    });
    updated++;
  }

  return NextResponse.json({
    season,
    updated,
    skipped,
    message: `Sezóna ${season.name} aktivní. Postoupeno: ${updated}, ponecháno: ${skipped}.`,
  });
}
