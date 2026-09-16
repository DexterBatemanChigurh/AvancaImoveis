import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function listRecentActivityLogs(limit = 100) {
  return db.query.activityLogs.findMany({
    orderBy: [desc(activityLogs.createdAt)],
    limit,
    with: { user: { columns: { id: true, name: true } } },
  });
}
