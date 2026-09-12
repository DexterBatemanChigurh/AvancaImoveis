import { NextResponse, type NextRequest } from "next/server";

import { listPublicPropertiesByIds } from "@/features/properties/queries";

/** Usado pela página /favoritos — recebe os ids salvos no localStorage do visitante. */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);

  const properties = await listPublicPropertiesByIds(ids).catch(() => []);
  return NextResponse.json({ properties });
}
