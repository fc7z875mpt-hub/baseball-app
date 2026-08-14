import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export async function requireSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

export function isStaff(session: Session): boolean {
  const role = session.user.role;
  return role === "ADMIN" || role === "ORGANIZER";
}
