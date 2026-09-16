import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Limitador de taxa compartilhado entre instâncias (Vercel roda cada
 * request numa função serverless independente — um limitador em memória
 * por processo, como o antigo, simplesmente não vale em produção: cada
 * invocação pode cair numa instância "zerada"). `key` já é a identidade
 * (ex.: "lead:<hash-do-ip>") — sem timestamps próprios, é dado efêmero de
 * controle, não registro de negócio.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
