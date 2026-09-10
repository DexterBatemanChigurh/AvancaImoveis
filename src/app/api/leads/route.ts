import { NextResponse, type NextRequest } from "next/server";

import { submitInterest } from "@/features/leads/actions";

/**
 * Endpoint alternativo para o formulário "Tenho interesse", caso um dia
 * o formulário precise ser enviado de fora do Next (ex.: landing estática).
 * A página do imóvel usa a Server Action diretamente.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await submitInterest({ ok: false }, form);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
