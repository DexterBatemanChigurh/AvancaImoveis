import { NextResponse, type NextRequest } from "next/server";

import { fetchMunicipalities } from "@/lib/ibge";

/** Usado pelo filtro de cidade do catálogo — GET /api/municipios?uf=MG */
export async function GET(request: NextRequest) {
  const uf = (request.nextUrl.searchParams.get("uf") ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) {
    return NextResponse.json({ municipios: [] }, { status: 400 });
  }

  const municipios = await fetchMunicipalities(uf).catch(() => []);
  return NextResponse.json(
    { municipios },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
  );
}
