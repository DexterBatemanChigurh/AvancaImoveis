import type { Metadata } from "next";
import type { ReactNode } from "react";

import { StatCard } from "@/components/admin/stat-card";
import { getDashboardMetrics } from "@/features/dashboard/queries";
import { PROPERTY_STATUS_LABELS } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const m = await getDashboardMetrics().catch(() => null);

  if (!m) {
    return (
      <Empty message="Configure o banco (veja o README) e rode as migrations para ver os indicadores." />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clientes"
          value={m.clientsTotal}
          hint={`${m.clientsThisMonth} novos neste mês`}
        />
        <StatCard label="Negócios fechados" value={m.dealsWonThisMonth} hint="no mês" />
        <StatCard
          label="Visitas"
          value={m.visitsDone}
          hint={`${m.visitsUpcoming} agendadas`}
        />
        <StatCard
          label="Imóveis ativos"
          value={
            m.propertiesByStatus.find((p) => p.status === "disponivel")?.n ?? 0
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Propostas em aberto" value={m.proposalsOpen} />
        <StatCard
          label="Vendas no mês"
          value={m.salesCountThisMonth}
          hint={formatBRL(m.salesValueThisMonth)}
        />
        <StatCard label="Comissão no mês" value={formatBRL(m.commissionThisMonth)} />
        <StatCard
          label="Taxa de conversão"
          value={m.conversionRate != null ? `${m.conversionRate}%` : "—"}
          hint="negócios ganhos / total"
        />
        <StatCard label="Cliques no WhatsApp" value={m.whatsappClicksThisMonth} hint="no mês" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Funil (CRM)">
          {m.dealsByStage.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma etapa cadastrada.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {m.dealsByStage.map((s) => (
                <li key={s.stage} className="flex items-center justify-between text-sm">
                  <span>{s.stage}</span>
                  <span className="font-mono tabular-nums">{s.n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Imóveis por status">
          <ul className="flex flex-col gap-2">
            {m.propertiesByStatus.map((p) => (
              <li key={p.status} className="flex items-center justify-between text-sm">
                <span>{PROPERTY_STATUS_LABELS[p.status]}</span>
                <span className="font-mono tabular-nums">{p.n}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Mais visualizados">
          {m.topViewed.length === 0 ? (
            <p className="text-sm text-muted">Sem dados ainda.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {m.topViewed.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.title}</span>
                  <span className="font-mono tabular-nums">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl">Dashboard</h1>
      <p className="rounded-card border border-dashed border-line p-8 text-sm text-muted">
        {message}
      </p>
    </div>
  );
}
