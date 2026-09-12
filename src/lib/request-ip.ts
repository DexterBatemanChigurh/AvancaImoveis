import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { env } from "@/lib/env";

/** IP do visitante a partir dos headers do proxy (funciona atrás de Caddy/nginx). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * Nunca guardamos o IP puro — só o hash, o suficiente pra deduplicar.
 * Usa um tempero próprio (IP_HASH_PEPPER), separado do AUTH_PEPPER usado
 * no hash de senha — são domínios de segurança diferentes.
 */
export function hashIp(ip: string): string {
  const pepper = env.IP_HASH_PEPPER ?? env.AUTH_PEPPER ?? "";
  return createHash("sha256").update(ip + pepper).digest("hex");
}
