import "server-only";

import { count, gte } from "drizzle-orm";

import { db } from "@/db";
import { whatsappClicks } from "@/db/schema";

export async function countWhatsappClicksSince(date: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(whatsappClicks)
    .where(gte(whatsappClicks.createdAt, date));
  return row?.n ?? 0;
}
