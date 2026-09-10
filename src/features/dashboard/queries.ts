import "server-only";

import { and, count, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, deals, properties, stages, visits } from "@/db/schema";

/**
 * Indicadores do dashboard (proposta §6).
 * Fase 1 entrega a base; os cálculos de funil ganham profundidade na Fase 2/3.
 */
export async function getDashboardMetrics() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    clientsTotal,
    clientsThisMonth,
    visitsDone,
    propertiesByStatus,
    dealsByStage,
    dealsWon,
    topViewed,
  ] = await Promise.all([
    db.select({ n: count() }).from(clients),
    db
      .select({ n: count() })
      .from(clients)
      .where(gte(clients.createdAt, startOfMonth)),
    db
      .select({ n: count() })
      .from(visits)
      .where(eq(visits.status, "realizada")),
    db
      .select({ status: properties.status, n: count() })
      .from(properties)
      .groupBy(properties.status),
    db
      .select({ stage: stages.name, position: stages.position, n: count(deals.id) })
      .from(stages)
      .leftJoin(deals, eq(deals.stageId, stages.id))
      .groupBy(stages.id, stages.name, stages.position)
      .orderBy(stages.position),
    db
      .select({ n: count() })
      .from(deals)
      .innerJoin(stages, eq(deals.stageId, stages.id))
      .where(and(eq(stages.isWon, true), gte(deals.closedAt, startOfMonth))),
    db
      .select({
        id: properties.id,
        title: properties.title,
        views: properties.viewsCount,
      })
      .from(properties)
      .orderBy(sql`${properties.viewsCount} desc`)
      .limit(5),
  ]);

  return {
    clientsTotal: clientsTotal[0]?.n ?? 0,
    clientsThisMonth: clientsThisMonth[0]?.n ?? 0,
    visitsDone: visitsDone[0]?.n ?? 0,
    dealsWonThisMonth: dealsWon[0]?.n ?? 0,
    propertiesByStatus,
    dealsByStage,
    topViewed,
  };
}
