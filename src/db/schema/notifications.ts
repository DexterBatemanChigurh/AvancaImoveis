import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { notificationKind } from "./_shared";

/**
 * Notificação in-app (sino no painel). Caixa única compartilhada — não por
 * usuário: as contas do painel já são compartilhadas entre a equipe (mesmo
 * login pra Rogério/Fernanda/Ana Clara), então uma notificação "lida" por
 * qualquer um já vale pra todos, sem precisar de uma tabela de leitura por
 * usuário.
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: notificationKind("kind").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationKind = (typeof notificationKind.enumValues)[number];
