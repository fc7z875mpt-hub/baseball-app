import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Session } from "next-auth";

/** Vrátí session admina, nebo null. */
export async function requireAdmin(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

const CATEGORY_ORDER = ["U7", "U8", "U9", "U10", "U11", "U12", "U13", "U15", "U18"] as const;

export function nextCategory(current: string | null): string | null {
  if (!current) return null;
  const idx = (CATEGORY_ORDER as readonly string[]).indexOf(current);
  if (idx < 0 || idx >= CATEGORY_ORDER.length - 1) return current;
  return CATEGORY_ORDER[idx + 1];
}
