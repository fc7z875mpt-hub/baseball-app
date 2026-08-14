import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

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
      createdAt: true,
      players: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          category: true,
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
  const { userId, status, role } = body as {
    userId: string;
    status?: "APPROVED" | "REJECTED" | "PENDING";
    role?: "PARENT" | "ORGANIZER" | "ADMIN";
  };

  if (!userId) {
    return NextResponse.json({ error: "Chybí userId" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (status) data.status = status;
  if (role) data.role = role;

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
    },
  });

  return NextResponse.json({ user });
}
