import {
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { clients } from "./clients";
import { properties } from "./properties";
import { stages } from "./stages";
import { users } from "./users";

/**
 * Negócio = card do Kanban (proposta §3).
 * Um card por cliente dentro do funil, com a próxima ação sempre visível.
 */
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => stages.id, { onDelete: "restrict" }),

  title: text("title"), // opcional; por padrão usa o nome do cliente
  position: integer("position").notNull().default(0), // ordem dentro da coluna
  estimatedValue: doublePrecision("estimated_value"),

  nextActionNote: text("next_action_note"),
  nextActionAt: timestamp("next_action_at", { withTimezone: true }),

  lostReason: text("lost_reason"),
  closedAt: timestamp("closed_at", { withTimezone: true }),

  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

/** Imóveis de interesse ligados a um negócio (N:N). */
export const dealProperties = pgTable(
  "deal_properties",
  {
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.dealId, t.propertyId] }),
  }),
);

export type DealProperty = typeof dealProperties.$inferSelect;
