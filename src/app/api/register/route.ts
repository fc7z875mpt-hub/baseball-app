import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  firstName: z.string().min(2, "Jméno musí mít alespoň 2 znaky"),
  lastName: z.string().min(2, "Příjmení musí mít alespoň 2 znaky"),
  email: z.string().email("Neplatný e-mail"),
  password: z
    .string()
    .min(8, "Heslo musí mít alespoň 8 znaků")
    .regex(/[A-Z]/, "Heslo musí obsahovat velké písmeno")
    .regex(/[0-9]/, "Heslo musí obsahovat číslo"),
  childFirstName: z.string().min(2, "Jméno dítěte musí mít alespoň 2 znaky"),
  childLastName: z.string().min(2, "Příjmení dítěte musí mít alespoň 2 znaky"),
  category: z.enum(["U8", "U9", "U10", "U11", "U12", "U13", "U15", "U18"], {
    errorMap: () => ({ message: "Vyberte platnou kategorii" }),
  }),
  teamIds: z.array(z.string()).min(1, "Vyberte alespoň jeden tým"),
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
        { error: "Uživatel s tímto e-mailem již existuje" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Zatím bez vazby na tým (placeholder) – týmy založí admin
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
            category: data.category,
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
        message: "Registrace úspěšná. Účet čeká na schválení administrátorem.",
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
      { error: "Něco se pokazilo. Zkuste to prosím znovu." },
      { status: 500 }
    );
  }
}
