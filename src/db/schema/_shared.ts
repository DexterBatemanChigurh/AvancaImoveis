import { pgEnum, timestamp } from "drizzle-orm/pg-core";

/**
 * Colunas de auditoria reaproveitadas por todas as tabelas.
 * `updatedAt` é atualizado pela aplicação (ou por trigger, se preferirmos depois).
 */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/* ------------------------------------------------------------------ */
/* Enums de domínio — centralizados para reuso entre schema e app.    */
/* ------------------------------------------------------------------ */

export const propertyStatus = pgEnum("property_status", [
  "rascunho",
  "disponivel",
  "reservado",
  "vendido",
  "pausado",
]);

export const propertyKind = pgEnum("property_kind", [
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "outro",
]);

/** Tipo de captação do imóvel junto ao proprietário. */
export const listingType = pgEnum("listing_type", ["exclusiva", "aberta"]);

export const leadSource = pgEnum("lead_source", [
  "site",
  "indicacao",
  "instagram",
  "portal",
  "outro",
]);

export const visitStatus = pgEnum("visit_status", [
  "agendada",
  "realizada",
  "cancelada",
  "nao_compareceu",
]);

export const proposalStatus = pgEnum("proposal_status", [
  "enviada",
  "contraproposta",
  "aceita",
  "recusada",
  "expirada",
]);

export const activityKind = pgEnum("activity_kind", [
  "nota",
  "ligacao",
  "email",
  "whatsapp",
  "mudanca_etapa",
  "visita",
]);

/** Tipo de evento que gera notificação in-app (sino no painel). */
export const notificationKind = pgEnum("notification_kind", [
  "lead",
  "visita",
  "proposta",
  "venda",
]);
