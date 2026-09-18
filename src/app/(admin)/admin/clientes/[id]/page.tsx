import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ClientForm } from "@/components/admin/client-form";
import { ClientTimeline } from "@/components/admin/client-timeline";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { MatchList } from "@/components/admin/match-list";
import {
  addClientNote,
  anonymizeClient,
  deleteClientPermanently,
  updateClient,
} from "@/features/clients/actions";
import { getClientById } from "@/features/clients/queries";
import { listPropertiesForMatch } from "@/features/properties/queries";
import { VISIT_STATUS_LABELS } from "@/lib/constants";
import { formatBRL, formatDateTime } from "@/lib/format";
import { matchScore } from "@/lib/match";

export const metadata: Metadata = { title: "Editar cliente" };

type Params = Promise<{ id: string }>;

export default async function EditarClientePage({ params }: { params: Params }) {
  const { id } = await params;
  const client = await getClientById(id).catch(() => null);
  if (!client) notFound();

  const boundUpdate = updateClient.bind(null, id);
  const boundAddNote = addClientNote.bind(null, id);
  const boundAnonymize = anonymizeClient.bind(null, id);
  const boundDeletePermanently = deleteClientPermanently.bind(null, id);

  const candidateProperties = await listPropertiesForMatch().catch(() => []);
  const matches = candidateProperties.map((property) => ({
    id: property.id,
    label: `${property.code} — ${property.title}`,
    href: `/admin/imoveis/${property.id}`,
    sub: formatBRL(property.salePrice),
    result: matchScore(client, property),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{client.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <form action={boundAnonymize}>
            <ConfirmSubmitButton
              variant="outline"
              size="sm"
              confirmMessage="Isso apaga (ou anonimiza, se houver histórico) os dados pessoais deste cliente e não pode ser desfeito. Confirmar exclusão de dados (LGPD)?"
            >
              Excluir dados (LGPD)
            </ConfirmSubmitButton>
          </form>
          <form action={boundDeletePermanently}>
            <ConfirmSubmitButton
              variant="danger"
              size="sm"
              confirmMessage={`Excluir "${client.name}" PERMANENTEMENTE? Isso remove o cliente e TUDO ligado a ele — negócios, visitas, propostas e vendas fechadas — sem preservar nada. Não tem como desfazer.`}
            >
              Excluir permanentemente
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>
      <p className="text-xs text-muted">
        <strong>Excluir dados (LGPD)</strong> anonimiza os dados pessoais mas
        preserva negócios/visitas já registrados (a pedido do titular).{" "}
        <strong>Excluir permanentemente</strong> apaga tudo, sem exceção —
        use só quando quiser remover o cliente de vez, inclusive do
        histórico comercial.
      </p>

      {client.anonymizedAt && (
        <p className="rounded-md border border-line bg-surface-2 p-3 text-sm text-muted">
          Dados pessoais anonimizados em {formatDateTime(client.anonymizedAt)} a
          pedido do titular. O histórico comercial abaixo foi preservado.
        </p>
      )}

      {client.deals.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">
            Negócios
          </p>
          <ul className="flex flex-col gap-2">
            {client.deals.map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span>{d.title ?? client.name}</span>
                <span className="flex items-center gap-2 text-muted">
                  {d.estimatedValue != null && formatBRL(d.estimatedValue)}
                  <Badge tone="accent">{d.stage.name}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {client.visits.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">
            Visitas
          </p>
          <ul className="flex flex-col gap-2">
            {client.visits.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/admin/imoveis/${v.property.id}`}
                  className="text-accent-ink hover:underline"
                >
                  {v.property.title}
                </Link>
                <span className="flex items-center gap-2 text-muted">
                  {formatDateTime(v.scheduledAt)}
                  <Badge>{VISIT_STATUS_LABELS[v.status]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <MatchList title="Imóveis compatíveis" items={matches} />

      <ClientForm action={boundUpdate} client={client} />

      <ClientTimeline activities={client.activities} addNoteAction={boundAddNote} />
    </div>
  );
}
