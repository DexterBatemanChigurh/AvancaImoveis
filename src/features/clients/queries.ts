import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, clients, deals } from "@/db/schema";

/** Lista com a contagem de negócios — usada na tela de lista. */
export async function listClientsWithDealCount() {
  const rows = await db.query.clients.findMany({
    orderBy: [desc(clients.createdAt)],
    with: {
      deals: { columns: { id: true } },
    },
  });
  return rows.map((c) => ({
    ...c,
    dealCount: c.deals.length,
  }));
}

export async function getClientById(id: string) {
  return db.query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      deals: {
        orderBy: [desc(deals.createdAt)],
        with: { stage: true },
      },
      visits: {
        orderBy: (v, { desc }) => [desc(v.scheduledAt)],
        with: { property: { columns: { id: true, title: true, slug: true } } },
      },
      activities: {
        orderBy: [desc(activities.createdAt)],
        with: { author: { columns: { id: true, name: true } } },
      },
    },
  });
}
