/**
 * Popula os dados de referência: etapas do funil e categorias de documento.
 * Idempotente. Rode com:
 *
 *   node --env-file=.env.local --import tsx src/db/seed.ts
 *   (ou simplesmente: npm run db:seed)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { count } from "drizzle-orm";

import { db } from "./index";
import { documentCategories, stages } from "./schema";
import { DEFAULT_DOCUMENT_CATEGORIES, DEFAULT_STAGES } from "../lib/constants";

async function main() {
  const [{ n: stageCount } = { n: 0 }] = await db
    .select({ n: count() })
    .from(stages);

  if (stageCount === 0) {
    console.log("Seed: etapas do funil…");
    await db.insert(stages).values(
      DEFAULT_STAGES.map((s) => ({
        name: s.name,
        position: s.position,
        color: s.color,
        isWon: "isWon" in s ? Boolean(s.isWon) : false,
        isLost: "isLost" in s ? Boolean(s.isLost) : false,
      })),
    );
  } else {
    console.log(`Seed: ${stageCount} etapas já existem, pulando.`);
  }

  console.log("Seed: categorias de documento…");
  await db
    .insert(documentCategories)
    .values(DEFAULT_DOCUMENT_CATEGORIES.map((name, i) => ({ name, position: i })))
    .onConflictDoNothing(); // document_categories.name é UNIQUE

  console.log("Seed concluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
