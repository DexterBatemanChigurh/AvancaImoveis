import { boolean, doublePrecision, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps, propertyKind } from "./_shared";

/**
 * Alerta de busca salva pelo visitante (sem login — só e-mail).
 * Quando um imóvel novo bate com os critérios, dispara e-mail (ver
 * features/alerts/notify.ts, chamado a partir de properties/actions.ts
 * no momento em que o imóvel passa a "disponivel").
 */
export const searchAlerts = pgTable("search_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),

  district: text("district"),
  kind: propertyKind("kind"),
  minPrice: doublePrecision("min_price"),
  maxPrice: doublePrecision("max_price"),
  minBedrooms: integer("min_bedrooms"),

  active: boolean("active").notNull().default(true),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),

  /**
   * Confirmação de e-mail (double opt-in) — sem isso, qualquer um podia
   * cadastrar o e-mail de outra pessoa pra receber alertas indesejados.
   * `confirmedAt` nulo = ainda não confirmado, o alerta não dispara e-mail.
   * Quando o Resend não está configurado (dev/local), a criação já marca
   * como confirmado — não existe como mandar e-mail de confirmação nesse
   * caso, e o recurso já degrada assim em outros pontos do app.
   */
  confirmToken: text("confirm_token").unique(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export type SearchAlert = typeof searchAlerts.$inferSelect;
export type NewSearchAlert = typeof searchAlerts.$inferInsert;
