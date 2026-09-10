import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

/**
 * Proprietário do imóvel. Registro estritamente interno —
 * NUNCA é exposto no catálogo público (ver proposta §3 e §5).
 */
export const owners = pgTable("owners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  document: text("document"), // CPF/CNPJ, opcional
  notes: text("notes"),
  ...timestamps,
});

export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;
