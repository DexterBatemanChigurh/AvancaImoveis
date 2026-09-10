import { sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps, leadSource } from "./_shared";

/**
 * Cliente / Lead (proposta §3).
 * Critérios de busca ficam em campos estruturados para alimentar o
 * "match imóvel ↔ lead" (Fase 3).
 */
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  source: leadSource("source").notNull().default("site"),

  // Critérios de busca
  districts: text("districts").array().notNull().default(sql`'{}'::text[]`),
  budgetMin: doublePrecision("budget_min"),
  budgetMax: doublePrecision("budget_max"),
  minBedrooms: integer("min_bedrooms"),
  minParkingSpots: integer("min_parking_spots"),

  // LGPD — consentimento capturado no formulário público (proposta §5).
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentText: text("consent_text"),

  notes: text("notes"),
  ...timestamps,
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
