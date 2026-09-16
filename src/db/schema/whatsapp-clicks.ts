import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { properties } from "./properties";

/**
 * Clique em qualquer link de WhatsApp do site público — métrica pro
 * dashboard comercial. `propertyId` nulo = contato genérico (header,
 * rodapé, botão flutuante), não vinculado a um imóvel específico.
 */
export const whatsappClicks = pgTable("whatsapp_clicks", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WhatsappClick = typeof whatsappClicks.$inferSelect;
