import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps, visitStatus } from "./_shared";
import { clients } from "./clients";
import { deals } from "./deals";
import { properties } from "./properties";

/**
 * Visita a um imóvel (proposta §3/§4).
 * `remindAt` alimenta o lembrete automático (Fase 2).
 */
export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),

  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: visitStatus("status").notNull().default("agendada"),
  remindAt: timestamp("remind_at", { withTimezone: true }),
  reminderSent: boolean("reminder_sent").notNull().default(false),
  feedback: text("feedback"),
  ...timestamps,
});

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;
