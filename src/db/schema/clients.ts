import { sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps, leadSource, propertyKind } from "./_shared";

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
  kind: propertyKind("kind"),
  city: text("city"),
  districts: text("districts").array().notNull().default(sql`'{}'::text[]`),
  budgetMin: doublePrecision("budget_min"),
  budgetMax: doublePrecision("budget_max"),
  minBedrooms: integer("min_bedrooms"),
  minBathrooms: integer("min_bathrooms"),
  minParkingSpots: integer("min_parking_spots"),
  minArea: doublePrecision("min_area"),
  desiredFeatures: text("desired_features").array().notNull().default(sql`'{}'::text[]`),

  // LGPD — consentimento capturado no formulário público (proposta §5).
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentText: text("consent_text"),
  // Pedido de exclusão de dados (proposta §5): anonimiza em vez de apagar a
  // linha quando existem deals/visits/activities vinculados, pra não perder
  // o histórico comercial. Nula = cliente ativo normal.
  anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),

  notes: text("notes"),
  ...timestamps,
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
