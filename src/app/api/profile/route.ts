import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      greeting: true,
      role: true,
      canCompare: true,
      players: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          category: true,
          jerseyNumber: true,
          teams: {
            where: { isActive: true },
            select: {
              team: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  primaryColor: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const body = await req.json();
  const { greeting, currentPassword, newPassword } = body as {
    greeting?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  // Change password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Zadejte současné heslo" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Nové heslo musí mít alespoň 6 znaků" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Účet neexistuje" }, { status: 404 });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Současné heslo není správné" },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true, message: "Heslo změněno" });
  }

  // Update greeting
  if (typeof greeting === "string") {
    const clean = greeting.trim().slice(0, 40);
    await prisma.user.update({
      where: { id: userId },
      data: { greeting: clean || null },
    });
    return NextResponse.json({ ok: true, greeting: clean || null });
  }

  return NextResponse.json({ error: "Nic k uložení" }, { status: 400 });
}
