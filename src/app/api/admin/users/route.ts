import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      canCompare: true,
      createdAt: true,
      players: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          category: true,
          teams: {
            where: { isActive: true },
            select: {
              team: {
                select: { id: true, name: true, shortName: true, primaryColor: true },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, status, role, canCompare } = body as {
    userId: string;
    status?: "APPROVED" | "REJECTED" | "PENDING" | "SUSPENDED";
    role?: "PARENT" | "ORGANIZER" | "ADMIN";
    canCompare?: boolean;
  };

  if (!userId) {
    return NextResponse.json({ error: "Chybí userId" }, { status: 400 });
  }

  if (session.user.id === userId && status === "SUSPENDED") {
    return NextResponse.json({ error: "Nelze pozastavit vlastní účet" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (role) data.role = role;
  if (typeof canCompare === "boolean") data.canCompare = canCompare;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      canCompare: true,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId } = body as { userId: string };

  if (!userId) {
    return NextResponse.json({ error: "Chybí userId" }, { status: 400 });
  }

  if (session.user.id === userId) {
    return NextResponse.json({ error: "Nelze smazat vlastní účet" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "Uživatel neexistuje" }, { status: 404 });
  }
  if (target.role === "ADMIN") {
    return NextResponse.json({ error: "Nelze smazat admin účet" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true, message: "Uživatel a související data smazána" });
}
