import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps, activityKind } from "./_shared";
import { clients } from "./clients";
import { deals } from "./deals";
import { users } from "./users";

/**
 * Atividade — monta a linha do tempo do cliente e do negócio (proposta §3).
 * Fica ligada a um cliente e/ou a um negócio.
 */
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
  kind: activityKind("kind").notNull().default("nota"),
  body: text("body").notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
