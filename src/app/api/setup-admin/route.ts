import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Jednorázové vytvoření prvního admina.
 * Funguje jen pokud v DB ještě žádný ADMIN není.
 */
export async function POST() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin už existuje", email: existingAdmin.email },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash("Admin123!", 12);

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
      password: "Admin123!",
      note: "Po přihlášení si heslo změň.",
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    return NextResponse.json({ error: "Nepodařilo se vytvořit admina" }, { status: 500 });
  }
}
