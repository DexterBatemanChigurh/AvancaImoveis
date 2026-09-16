"use server";

import { eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import { countUnreadNotifications, listRecentNotifications } from "./queries";

/** Chamada direto do client (sino no painel) pra popular contagem + lista recente. */
export async function getNotificationsSummary() {
  await requireUser();
  const [unread, recent] = await Promise.all([
    countUnreadNotifications(),
    listRecentNotifications(10),
  ]);
  return { unread, recent };
}

export async function markNotificationRead(id: string): Promise<void> {
  await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(): Promise<void> {
  await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(isNull(notifications.readAt));
}
