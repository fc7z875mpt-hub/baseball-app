import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

/** Redirect na SVG favicon – funguje na moderním iOS i v prohlížeči */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ size: string }> }
) {
  try {
    const filePath = path.join(process.cwd(), "public", "favicon.svg");
    const buf = await readFile(filePath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
