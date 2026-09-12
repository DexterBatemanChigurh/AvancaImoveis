import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Migrations usam DIRECT_URL se definida, senão DATABASE_URL.
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("Defina DATABASE_URL (ou DIRECT_URL) para rodar o drizzle-kit.");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  casing: "snake_case",
  verbose: true,
  strict: true,
});
