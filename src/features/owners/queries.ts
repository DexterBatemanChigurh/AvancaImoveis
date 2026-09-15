import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { owners } from "@/db/schema";

export async function listOwners() {
  return db.query.owners.findMany({ orderBy: [asc(owners.name)] });
}

/** Lista com a contagem de imóveis vinculados — usada na tela de lista. */
export async function listOwnersWithPropertyCount() {
  const rows = await db.query.owners.findMany({
    orderBy: [asc(owners.name)],
    with: {
      properties: {
        columns: {},
        with: { property: { columns: { id: true } } },
      },
    },
  });
  return rows.map((o) => ({
    ...o,
    propertyCount: o.properties.length,
  }));
}

export async function getOwnerById(id: string) {
  return db.query.owners.findFirst({
    where: eq(owners.id, id),
    with: {
      properties: { with: { property: true } },
    },
  });
}
