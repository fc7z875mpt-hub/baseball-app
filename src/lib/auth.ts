import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Zadejte e-mail a heslo");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error("Neplatný e-mail nebo heslo");
        }

        if (user.status === "PENDING") {
          throw new Error("Účet čeká na schválení administrátorem");
        }

        if (user.status === "REJECTED") {
          throw new Error("Registrace byla zamítnuta");
        }

        if (user.status === "SUSPENDED") {
          throw new Error("Účet byl pozastaven. Kontaktujte administrátora.");
        }

        if (!user.passwordHash) {
          throw new Error("Neplatný e-mail nebo heslo");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Neplatný e-mail nebo heslo");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          canCompare: user.canCompare,
          firstName: user.firstName,
          lastName: user.lastName,
          greeting: user.greeting,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.canCompare = user.canCompare;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.greeting = user.greeting ?? null;
      }
      if (trigger === "update" && session) {
        if (session.greeting !== undefined) token.greeting = session.greeting;
        if (session.firstName) token.firstName = session.firstName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.canCompare = token.canCompare;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.greeting = token.greeting ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
