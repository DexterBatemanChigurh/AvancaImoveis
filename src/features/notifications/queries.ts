import "server-only";

import { count, desc, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notifications, type NotificationKind } from "@/db/schema";

export async function listRecentNotifications(limit = 10) {
  return db.query.notifications.findMany({
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export async function countUnreadNotifications() {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(isNull(notifications.readAt));
  return row?.n ?? 0;
}

/**
 * Cria uma notificação in-app. NÃO é uma Server Action (sem "use server") —
 * de propósito: só pode ser chamada a partir de outro código do servidor
 * (outras Server Actions), nunca diretamente pelo client, senão qualquer
 * um poderia forjar notificações arbitrárias no painel.
 */
export async function createNotification(input: {
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
}): Promise<void> {
  await db.insert(notifications).values({
    kind: input.kind,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });
}
