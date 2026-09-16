import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { VisitForm } from "@/components/admin/visit-form";
import { VisitStatusForm } from "@/components/admin/visit-status-form";
import { listClientsForSelect } from "@/features/clients/queries";
import { listPropertiesForSelect } from "@/features/properties/queries";
import { listVisits } from "@/features/visits/queries";
import { VISIT_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Visitas" };

const STATUS_TONE = {
  agendada: "accent",
  realizada: "ok",
  cancelada: "neutral",
  nao_compareceu: "warn",
} as const;

export default async function VisitasPage() {
  const [visits, clients, properties] = await Promise.all([
    listVisits().catch(() => []),
    listClientsForSelect().catch(() => []),
    listPropertiesForSelect().catch(() => []),
  ]);

  const groups = new Map<string, typeof visits>();
  for (const v of visits) {
    const key = formatDate(v.scheduledAt);
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Visitas</h1>

      <VisitForm clients={clients} properties={properties} />

      {visits.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhuma visita agendada ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([day, dayVisits]) => (
            <div key={day} className="flex flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-wide text-muted">
                {day}
              </p>
              <div className="flex flex-col gap-2">
                {dayVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDateTime(v.scheduledAt)}</span>
                        <Badge tone={STATUS_TONE[v.status]}>
                          {VISIT_STATUS_LABELS[v.status]}
                        </Badge>
                      </div>
                      <span>
                        <Link
                          href={`/admin/clientes/${v.client.id}`}
                          className="text-accent-ink hover:underline"
                        >
                          {v.client.name}
                        </Link>
                        {" · "}
                        <Link
                          href={`/admin/imoveis/${v.property.id}`}
                          className="text-accent-ink hover:underline"
                        >
                          {v.property.title}
                        </Link>
                      </span>
                      {v.feedback && (
                        <span className="text-muted">Feedback: {v.feedback}</span>
                      )}
                    </div>
                    <VisitStatusForm visitId={v.id} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
