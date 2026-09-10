import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Cliente Drizzle único por processo.
 * Em serverless (Vercel) o pooler do Supabase (porta 6543) já cuida das conexões,
 * então mantemos `max: 1` e sem prepared statements.
 */
const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
};

const client =
  globalForDb._pg ??
  postgres(env.DATABASE_URL, {
    max: 1,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pg = client;
}

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };
