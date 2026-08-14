import { NextRequest, NextResponse } from "next/server";

/**
 * Setup/bootstrap endpointy smí volat jen s tajným klíčem SETUP_SECRET
 * (header x-setup-secret nebo body.secret).
 * Bez nastaveného SETUP_SECRET jsou endpointy vypnuté.
 */
export function requireSetupSecret(
  req: NextRequest,
  bodySecret?: string | null
): NextResponse | null {
  const expected = process.env.SETUP_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "Setup endpoint je vypnutý. Nastav env SETUP_SECRET, nebo endpoint odstraň.",
      },
      { status: 403 }
    );
  }

  const header = req.headers.get("x-setup-secret");
  const provided = header || bodySecret || "";
  if (provided !== expected) {
    return NextResponse.json({ error: "Neplatný setup secret" }, { status: 401 });
  }
  return null;
}
