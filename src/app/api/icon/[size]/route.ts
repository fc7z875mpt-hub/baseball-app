import { NextRequest, NextResponse } from "next/server";

/** Jednoduchý fallback – SVG favicon */
export async function GET(
  _req: NextRequest,
  _ctx: { params: Promise<{ size: string }> }
) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a1628"/><path d="M50 12 L82 44 L50 28 L18 44 Z" fill="#c5cdd6"/><path d="M50 88 L82 56 L50 72 L18 56 Z" fill="#c5cdd6"/><path d="M12 50 L44 18 L28 50 L44 82 Z" fill="#c5cdd6"/><path d="M88 50 L56 18 L72 50 L56 82 Z" fill="#c5cdd6"/><circle cx="50" cy="50" r="18" fill="#fff"/><path d="M40 40 Q48 50 40 60" stroke="#e11d2e" stroke-width="2" fill="none"/><path d="M60 40 Q52 50 60 60" stroke="#e11d2e" stroke-width="2" fill="none"/></svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
