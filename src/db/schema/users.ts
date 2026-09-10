import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

/**
 * Espelho local dos usuários do Supabase Auth.
 * O `id` é o mesmo UUID do `auth.users`. Serve para exibir nome/autoria
 * sem consultar o schema `auth` diretamente.
 *
 * Fase 1: todos com o mesmo nível de acesso. `role` já existe para
 * quando quisermos papéis (ex.: Ana Clara só em imóveis) — ver proposta §7.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("equipe"), // "equipe" | "admin" (futuro)
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
