import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";

/**
 * Limitador de taxa compartilhado (tabela `rate_limits`, ver
 * db/schema/rate-limits.ts) — a versão anterior era em memória por
 * processo, o que não funciona em serverless (Vercel): cada request pode
 * cair numa instância diferente, "zerada", e o limite nunca é atingido de
 * verdade. Isso permitia furar o rate-limit de leads/alertas sem esforço.
 *
 * O UPSERT abaixo é uma única instrução atômica (não faz um SELECT e
 * depois um UPDATE separados) — evita a condição de corrida óbvia de
 * "duas requisições simultâneas leem o mesmo contador e as duas passam".
 *
 * true = permitido, false = estourou o limite pra essa chave.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const rows = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + (${windowMs}::text || ' milliseconds')::interval)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at <= now()
        THEN now() + (${windowMs}::text || ' milliseconds')::interval
        ELSE rate_limits.reset_at
      END
    RETURNING count
  `);
  const count = rows[0]?.count ?? 1;
  return count <= limit;
}
