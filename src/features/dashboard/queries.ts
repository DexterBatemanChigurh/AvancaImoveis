import "server-only";

import { and, count, eq, gte, inArray, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { clients, deals, properties, proposals, sales, stages, visits } from "@/db/schema";
import { countWhatsappClicksSince } from "@/features/analytics/queries";
import { startOfMonthBrasilia } from "@/lib/format";

/**
 * Indicadores do dashboard (proposta §6).
 * Fase 1 entrega a base; Fase E preenche visitas/propostas/vendas/comissão
 * e a taxa de conversão, que até então ficavam sempre zerados por falta de
 * UI pra gerar esses dados (Fase C/D).
 */
export async function getDashboardMetrics() {
  const startOfMonth = startOfMonthBrasilia();

  const [
    clientsTotal,
    clientsThisMonth,
    visitsDone,
    visitsUpcoming,
    proposalsOpen,
    salesThisMonth,
    dealsTotal,
    propertiesByStatus,
    dealsByStage,
    dealsWon,
    topViewed,
    whatsappClicksThisMonth,
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
      .select({ n: count() })
      .from(visits)
      .where(and(eq(visits.status, "agendada"), gte(visits.scheduledAt, new Date()))),
    db
      .select({ n: count() })
      .from(proposals)
      .where(inArray(proposals.status, ["enviada", "contraproposta"])),
    db
      .select({
        n: count(),
        value: sum(sales.saleValue),
        commission: sum(sales.commissionValue),
      })
      .from(sales)
      .where(gte(sales.saleDate, startOfMonth)),
    db.select({ n: count() }).from(deals),
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
    countWhatsappClicksSince(startOfMonth),
  ]);

  const dealsTotalCount = dealsTotal[0]?.n ?? 0;
  // "Ganho" é contado sobre TODOS os negócios já fechados (não só no mês) —
  // dá a taxa de conversão histórica do funil, diferente do card
  // "Negócios fechados" acima, que é só o mês corrente.
  const dealsWonTotal = await db
    .select({ n: count() })
    .from(deals)
    .innerJoin(stages, eq(deals.stageId, stages.id))
    .where(eq(stages.isWon, true));

  return {
    clientsTotal: clientsTotal[0]?.n ?? 0,
    clientsThisMonth: clientsThisMonth[0]?.n ?? 0,
    visitsDone: visitsDone[0]?.n ?? 0,
    visitsUpcoming: visitsUpcoming[0]?.n ?? 0,
    proposalsOpen: proposalsOpen[0]?.n ?? 0,
    salesCountThisMonth: salesThisMonth[0]?.n ?? 0,
    salesValueThisMonth: Number(salesThisMonth[0]?.value ?? 0),
    commissionThisMonth: Number(salesThisMonth[0]?.commission ?? 0),
    dealsWonThisMonth: dealsWon[0]?.n ?? 0,
    conversionRate:
      dealsTotalCount > 0
        ? Math.round(((dealsWonTotal[0]?.n ?? 0) / dealsTotalCount) * 100)
        : null,
    whatsappClicksThisMonth,
    propertiesByStatus,
    dealsByStage,
    topViewed,
  };
}
