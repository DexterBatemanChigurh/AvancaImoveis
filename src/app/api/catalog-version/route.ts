import { count, max } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { properties, propertyPhotos } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Sinal leve de "o catálogo mudou" pra polling (ver live-refresh.tsx) —
 * substitui o antigo /api/events (SSE + EventEmitter em memória), que
 * dependia de processo único e não funciona em serverless (várias
 * instâncias, sem memória compartilhada). Combina contagem + timestamp
 * mais recente pra pegar criação, edição, exclusão e mudança de fotos.
 */
export async function GET() {
  const [[p], [ph]] = await Promise.all([
    db
      .select({ n: count(), latest: max(properties.updatedAt) })
      .from(properties),
    db
      .select({ n: count(), latest: max(propertyPhotos.updatedAt) })
      .from(propertyPhotos),
  ]);

  const version = [
    p?.n ?? 0,
    p?.latest?.toISOString() ?? "",
    ph?.n ?? 0,
    ph?.latest?.toISOString() ?? "",
  ].join(":");

  return NextResponse.json({ version });
}
