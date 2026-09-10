import "server-only";

import { asc } from "drizzle-orm";

import { db } from "@/db";
import { owners } from "@/db/schema";

export async function listOwners() {
  return db.query.owners.findMany({ orderBy: [asc(owners.name)] });
}
