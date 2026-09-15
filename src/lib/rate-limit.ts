import "server-only";

/**
 * Limitador em memória, por processo — suficiente para o porte atual (uma
 * única instância `next start` num VPS pequeno, sem múltiplos processos
 * atrás de um load balancer). Se um dia isso mudar, precisa virar um
 * limitador compartilhado (Redis, ou uma tabela no Postgres) — não é o
 * caso hoje.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** true = permitido, false = estourou o limite pra essa chave. */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

// Limpeza periódica pra não vazar memória com chaves antigas (IPs que não voltam mais).
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, CLEANUP_INTERVAL_MS);
cleanup.unref();
