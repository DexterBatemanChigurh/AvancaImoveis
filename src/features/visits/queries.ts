import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/db";
import { visits } from "@/db/schema";

export async function listVisits() {
  return db.query.visits.findMany({
    orderBy: [desc(visits.scheduledAt)],
    with: {
      client: { columns: { id: true, name: true, phone: true } },
      property: { columns: { id: true, title: true, slug: true } },
    },
  });
}
