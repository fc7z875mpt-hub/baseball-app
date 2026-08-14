import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: Role;
    canCompare: boolean;
    firstName: string;
    lastName: string;
    greeting?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      canCompare: boolean;
      firstName: string;
      lastName: string;
      greeting?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    canCompare: boolean;
    firstName: string;
    lastName: string;
    greeting?: string | null;
  }
}
