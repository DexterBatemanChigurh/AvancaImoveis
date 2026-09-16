import { doublePrecision, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { clients } from "./clients";
import { deals } from "./deals";
import { properties } from "./properties";

/**
 * Venda fechada. Criada dentro da MESMA transação que fecha o deal
 * (stage isWon) e marca o imóvel como vendido — nunca isolada.
 * Um deal só pode ter uma venda (unique em deal_id).
 */
export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id")
    .notNull()
    .unique()
    .references(() => deals.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),

  saleDate: timestamp("sale_date", { withTimezone: true }).notNull().defaultNow(),
  saleValue: doublePrecision("sale_value").notNull(),
  commissionPct: doublePrecision("commission_pct"),
  commissionValue: doublePrecision("commission_value"),
  notes: text("notes"),
  ...timestamps,
});

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
