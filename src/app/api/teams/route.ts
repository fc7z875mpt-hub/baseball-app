import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Veřejný seznam aktivních týmů pro registraci */
export async function GET() {
  const teams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      shortName: true,
      primaryColor: true,
    },
  });

  return NextResponse.json({ teams });
}
