import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

/**
 * Etapa do funil do CRM — CONFIGURÁVEL (proposta §3).
 * Seed inicial: Novo · Contato feito · Visita agendada · Proposta · Fechado · Perdido.
 *
 * `isWon` / `isLost` marcam as colunas terminais para os cálculos do dashboard
 * (negócios fechados, taxa de conversão).
 */
export const stages = pgTable("stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  color: text("color").notNull().default("#1a6270"),
  isWon: boolean("is_won").notNull().default(false),
  isLost: boolean("is_lost").notNull().default(false),
  ...timestamps,
});

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;
