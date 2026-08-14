import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSetupSecret } from "@/lib/setup-guard";

/** Jednorázový seed – týmy a sezóna. Vyžaduje SETUP_SECRET. */
export async function POST(req: NextRequest) {
  try {
    let body: { secret?: string } = {};
    try {
      body = await req.json();
    } catch {
      // empty ok
    }

    const denied = requireSetupSecret(req, body.secret);
    if (denied) return denied;

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
      created.push("teams");
    }

    if (seasonCount === 0) {
      const year = new Date().getFullYear();
      await prisma.season.create({
        data: {
          name: `Sezóna ${year}`,
          year,
          isActive: true,
        },
      });
      created.push("season");
    }

    return NextResponse.json({
      message: created.length ? `Vytvořeno: ${created.join(", ")}` : "Už nasazeno",
      created,
    });
  } catch (error) {
    console.error("setup-seed:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
