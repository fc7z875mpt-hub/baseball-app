import { NextRequest, NextResponse } from "next/server";
import {
  ICON_32_B64,
  ICON_180_B64,
  ICON_192_B64,
  ICON_512_B64,
} from "@/lib/logo-assets";

const MAP: Record<string, string> = {
  "32": ICON_32_B64,
  "180": ICON_180_B64,
  "192": ICON_192_B64,
  "512": ICON_512_B64,
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ size: string }> }
) {
  const { size } = await ctx.params;
  const b64 = MAP[size];
  if (!b64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const buf = Buffer.from(b64, "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
