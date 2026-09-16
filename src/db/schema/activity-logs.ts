import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Auditoria técnica (diferente de `activities`, que é a timeline comercial
 * de cliente/negócio). Cobre ações administrativas sensíveis: criação/edição
 * de imóvel (inclui mudança de status/preço) e upload/remoção de documento.
 *
 * Grava `userId` — a CONTA usada, não necessariamente a pessoa, já que o
 * login da equipe é compartilhado (Rogério/Fernanda/Ana Clara) e só a conta
 * do desenvolvedor é individual. `set null` em vez de cascade: apagar um
 * usuário não deve apagar o histórico de auditoria dele.
 */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  entityType: text("entity_type").notNull(), // "property" | "document"
  entityId: uuid("entity_id").notNull(),
  action: text("action").notNull(), // "create" | "update" | "document_upload" | "document_delete"
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
