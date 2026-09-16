import "server-only";

import { asc, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { activities, clients, deals } from "@/db/schema";

/** Lista enxuta pra <select> (visitas, negócios manuais). */
export async function listClientsForSelect() {
  return db.query.clients.findMany({
    columns: { id: true, name: true },
    orderBy: [asc(clients.name)],
  });
}

/**
 * Clientes ativos com só as colunas que o match (lib/match.ts) usa.
 * Exclui clientes anonimizados (pedido de exclusão LGPD) — não faz sentido
 * sugerir imóveis pra um cadastro que não existe mais de verdade.
 */
export async function listClientsForMatch() {
  return db.query.clients.findMany({
    where: isNull(clients.anonymizedAt),
    columns: {
      id: true,
      name: true,
      kind: true,
      city: true,
      districts: true,
      budgetMin: true,
      budgetMax: true,
      minBedrooms: true,
      minBathrooms: true,
      minParkingSpots: true,
      minArea: true,
      desiredFeatures: true,
    },
  });
}

/** Lista com a contagem de negócios — usada na tela de lista. */
export async function listClientsWithDealCount() {
  const rows = await db.query.clients.findMany({
    orderBy: [desc(clients.createdAt)],
    with: {
      deals: { columns: { id: true } },
    },
  });
  return rows.map((c) => ({
    ...c,
    dealCount: c.deals.length,
  }));
}

export async function getClientById(id: string) {
  return db.query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      deals: {
        orderBy: [desc(deals.createdAt)],
        with: { stage: true },
      },
      visits: {
        orderBy: (v, { desc }) => [desc(v.scheduledAt)],
        with: { property: { columns: { id: true, title: true, slug: true } } },
      },
      activities: {
        orderBy: [desc(activities.createdAt)],
        with: { author: { columns: { id: true, name: true } } },
      },
    },
  });
}
