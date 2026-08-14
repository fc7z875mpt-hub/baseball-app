import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export const CATEGORY_ORDER = ["U8", "U9", "U10", "U11", "U12", "U13", "U15", "U18"] as const;

export function nextCategory(current: string | null | undefined): string | null {
  if (!current) return null;
  const idx = CATEGORY_ORDER.indexOf(current as any);
  if (idx < 0) return current;
  if (idx >= CATEGORY_ORDER.length - 1) return current; // U18 stays
  return CATEGORY_ORDER[idx + 1];
}
