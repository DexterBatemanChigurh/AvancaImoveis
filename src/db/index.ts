import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Cliente Drizzle único por processo.
 * `max: 1` + `prepare: false` funciona tanto com Postgres local quanto atrás
 * de um pooler em modo transação, caso a produção use um.
 */
const globalForDb = globalThis as unknown as {
  _pg?: ReturnType<typeof postgres>;
};

const client =
  globalForDb._pg ??
  postgres(env.DATABASE_URL, {
    max: 10,
    prepare: false,
    // "prefer": usa SSL quando o servidor exige (Render, por exemplo, recusa
    // conexão sem SSL), mas não quebra o Postgres local do docker-compose,
    // que não tem SSL configurado.
    ssl: "prefer",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pg = client;
}

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };
