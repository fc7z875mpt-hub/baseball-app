import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const MAX_LOGO_CHARS = 400_000; // ~300 KB base64

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { players: true } },
    },
  });

  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, shortName, primaryColor, secondaryColor, backgroundColor, logoUrl } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Název týmu je povinný (min. 2 znaky)" }, { status: 400 });
  }

  if (logoUrl && String(logoUrl).length > MAX_LOGO_CHARS) {
    return NextResponse.json({ error: "Logo je příliš velké (max. cca 250 KB)" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      shortName: shortName?.trim() || null,
      primaryColor: primaryColor || "#1e3a5f",
      secondaryColor: secondaryColor || "#7dd3fc",
      backgroundColor: backgroundColor || "#f0f9ff",
      logoUrl: logoUrl || null,
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, name, shortName, primaryColor, secondaryColor, backgroundColor, logoUrl, isActive } =
    body;

  if (!id) return NextResponse.json({ error: "Chybí id týmu" }, { status: 400 });

  if (logoUrl && String(logoUrl).length > MAX_LOGO_CHARS) {
    return NextResponse.json({ error: "Logo je příliš velké (max. cca 250 KB)" }, { status: 400 });
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(shortName !== undefined && { shortName: shortName ? String(shortName).trim() : null }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(secondaryColor !== undefined && { secondaryColor }),
      ...(backgroundColor !== undefined && { backgroundColor }),
      ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    },
  });

  return NextResponse.json({ team });
}
