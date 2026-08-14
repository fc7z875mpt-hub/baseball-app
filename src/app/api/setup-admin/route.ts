import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSetupSecret } from "@/lib/setup-guard";

/**
 * Bootstrap admin – vyžaduje SETUP_SECRET.
 * POST {} → vytvořit admina (jen pokud neexistuje)
 * POST { resetPassword: true } → reset hesla existujícího admina
 *
 * Heslo: ADMIN_INITIAL_PASSWORD z env, jinak jednorázově vygenerované.
 * Heslo se vrací v odpovědi jen při úspěšném volání se secretem.
 */
export async function POST(req: NextRequest) {
  try {
    let body: { resetPassword?: boolean; secret?: string } = {};
    try {
      body = await req.json();
    } catch {
      // empty body ok
    }

    const denied = requireSetupSecret(req, body.secret);
    if (denied) return denied;

    const password =
      process.env.ADMIN_INITIAL_PASSWORD?.trim() ||
      `Dy#${Math.random().toString(36).slice(2, 10)}!xQ`;

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (body.resetPassword && existingAdmin) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { passwordHash },
      });
      return NextResponse.json({
        message: "Heslo admina změněno",
        email: existingAdmin.email,
        password,
      });
    }

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin už existuje", email: existingAdmin.email },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@diamondyouth.cz",
        passwordHash,
        firstName: "Admin",
        lastName: "Diamond",
        role: "ADMIN",
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      message: "Admin vytvořen",
      email: admin.email,
      password,
    });
  } catch (error) {
    console.error("setup-admin:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
