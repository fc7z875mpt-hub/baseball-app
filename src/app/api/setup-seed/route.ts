import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Jednorázový seed – týmy a sezóna, pokud ještě neexistují */
export async function POST() {
  try {
    const teamCount = await prisma.team.count();
    const seasonCount = await prisma.season.count();

    const created: string[] = [];

    if (teamCount === 0) {
      await prisma.team.createMany({
        data: [
          {
            name: "Hroši Brno",
            shortName: "HRO",
            primaryColor: "#1e3a5f",
            secondaryColor: "#7dd3fc",
            backgroundColor: "#f0f9ff",
            isActive: true,
          },
          {
            name: "Draci Brno",
            shortName: "DRA",
            primaryColor: "#b91c1c",
            secondaryColor: "#fca5a5",
            backgroundColor: "#fef2f2",
            isActive: true,
          },
        ],
      });
      created.push("týmy");
    }

    if (seasonCount === 0) {
      await prisma.season.create({
        data: {
          name: "Sezóna 2026",
          year: 2026,
          isActive: true,
        },
      });
      created.push("sezóna 2026");
    }

    const teams = await prisma.team.findMany({
      select: { id: true, name: true, shortName: true },
    });
    const seasons = await prisma.season.findMany({
      select: { id: true, name: true, year: true, isActive: true },
    });

    return NextResponse.json({
      message: created.length ? `Vytvořeno: ${created.join(", ")}` : "Už existuje – nic nového",
      teams,
      seasons,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed selhal" }, { status: 500 });
  }
}
