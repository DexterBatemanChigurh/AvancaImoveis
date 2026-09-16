import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, deals, proposals, stages } from "@/db/schema";

export async function listStages() {
  return db.query.stages.findMany({ orderBy: [asc(stages.position)] });
}

/** Board completo do Kanban — colunas (stages) com os cards (deals) já ordenados. */
export async function listBoard() {
  return db.query.stages.findMany({
    orderBy: [asc(stages.position)],
    with: {
      deals: {
        orderBy: [asc(deals.position)],
        with: {
          client: { columns: { id: true, name: true, phone: true } },
          properties: {
            with: { property: { columns: { id: true, title: true } } },
          },
          sale: { columns: { id: true } },
        },
      },
    },
  });
}

export async function getDealById(id: string) {
  return db.query.deals.findFirst({
    where: eq(deals.id, id),
    with: {
      client: true,
      stage: true,
      properties: {
        with: { property: { columns: { id: true, title: true, slug: true, salePrice: true } } },
      },
      activities: {
        orderBy: [desc(activities.createdAt)],
        with: { author: { columns: { id: true, name: true } } },
      },
      proposals: {
        orderBy: [desc(proposals.proposedAt)],
        with: { property: { columns: { id: true, title: true } } },
      },
      sale: true,
    },
  });
}
