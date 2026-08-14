import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seasons = await prisma.season.findMany({
    orderBy: { year: "desc" },
    include: {
      _count: { select: { matches: true, players: true } },
    },
  });

  return NextResponse.json({ seasons });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, year, setActive } = body;

  if (!year || typeof year !== "number") {
    return NextResponse.json({ error: "Rok sezóny je povinný" }, { status: 400 });
  }

  const seasonName = name?.trim() || `Sezóna ${year}`;

  if (setActive) {
    await prisma.season.updateMany({ data: { isActive: false } });
  }

  const season = await prisma.season.create({
    data: {
      name: seasonName,
      year,
      isActive: setActive !== false,
    },
  });

  return NextResponse.json({ season }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, isActive } = body;

  if (!id) return NextResponse.json({ error: "Chybí id sezóny" }, { status: 400 });

  if (isActive === true) {
    await prisma.season.updateMany({ data: { isActive: false } });
  }

  const season = await prisma.season.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    },
  });

  return NextResponse.json({ season });
}
