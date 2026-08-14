import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  firstName: z.string().min(2, "Jmeno musi mit alespon 2 znaky"),
  lastName: z.string().min(2, "Prijmeni musi mit alespon 2 znaky"),
  email: z.string().email("Neplatny e-mail"),
  password: z
    .string()
    .min(8, "Heslo musi mit alespon 8 znaku")
    .regex(/[A-Z]/, "Heslo musi obsahovat velke pismeno")
    .regex(/[0-9]/, "Heslo musi obsahovat cislo"),
  childFirstName: z.string().min(2, "Jmeno ditete musi mit alespon 2 znaky"),
  childLastName: z.string().min(2, "Prijmeni ditete musi mit alespon 2 znaky"),
  teamIds: z.array(z.string()).min(1, "Vyberte alespon jeden tym"),
  birthYear: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Uzivatel s timto e-mailem jiz existuje" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "PARENT",
        status: "PENDING",
        players: {
          create: {
            firstName: data.childFirstName,
            lastName: data.childLastName,
            birthYear: data.birthYear,
            teams: {
              create: data.teamIds.map((teamId) => ({
                teamId,
              })),
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registrace uspesna. Ucet ceka na schvaleni administratorem.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Neco se pokazilo. Zkuste to prosim znovu." },
      { status: 500 }
    );
  }
}
