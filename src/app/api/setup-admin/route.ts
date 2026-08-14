import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const NEW_PASSWORD = "Dy#Admin9kR2m!xQ";

/**
 * POST bez body = vytvořit admina (jen pokud neexistuje)
 * POST s { "resetPassword": true } = nastavit silné heslo existujícímu adminovi
 */
export async function POST(req: NextRequest) {
  try {
    let body: { resetPassword?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // empty body ok
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (body.resetPassword && existingAdmin) {
      const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { passwordHash },
      });
      return NextResponse.json({
        message: "Heslo admina změněno",
        email: existingAdmin.email,
        password: NEW_PASSWORD,
      });
    }

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin už existuje", email: existingAdmin.email },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

    const admin = await prisma.user.create({
      data: {
        email: "admin@diamondyouth.cz",
        passwordHash,
        firstName: "Admin",
        lastName: "Diamond",
        role: "ADMIN",
        status: "APPROVED",
        canCompare: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: "Admin vytvořen",
      email: admin.email,
      password: NEW_PASSWORD,
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    return NextResponse.json({ error: "Nepodařilo se" }, { status: 500 });
  }
}
