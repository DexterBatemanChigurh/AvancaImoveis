import { doublePrecision, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { proposalStatus, timestamps } from "./_shared";
import { clients } from "./clients";
import { deals } from "./deals";
import { properties } from "./properties";

/**
 * Proposta de compra dentro de um negócio (spec de evolução da plataforma).
 * Histórico fica visível no card do deal — um deal pode ter várias propostas
 * (contraproposta vira uma nova linha, não edita a anterior).
 */
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .references(() => deals.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),

  value: doublePrecision("value").notNull(),
  proposedAt: timestamp("proposed_at", { withTimezone: true }).notNull().defaultNow(),
  status: proposalStatus("status").notNull().default("enviada"),
  notes: text("notes"),
  ...timestamps,
});

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
