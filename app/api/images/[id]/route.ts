import { NextRequest } from "next/server";

import { getDriveConfig, isDemoMode } from "@/lib/galleryConfig";
import { fetchDriveImage } from "@/lib/googleDrive";
import { verifyImageToken } from "@/lib/imageTokens";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const notFound = () =>
    new Response("Image not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  if (isDemoMode()) return notFound();
  try {
    const { id } = await context.params;
    const token = request.nextUrl.searchParams.get("token");
    const config = getDriveConfig();
    if (
      token == null ||
      !verifyImageToken(id, token, config.folderId, config.signingSecret)
    )
      return notFound();
    const image = await fetchDriveImage(id, config.folderId);
    if (image == null) return notFound();
    return new Response(image.response.body, {
      headers: {
        "Content-Type": image.mimeType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Image temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
