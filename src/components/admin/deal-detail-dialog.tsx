"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { CloseDealDialog } from "@/components/admin/close-deal-dialog";
import { ClientTimeline } from "@/components/admin/client-timeline";
import { LoseDealDialog } from "@/components/admin/lose-deal-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { addDealNote, getDealDetail, updateDealDetails } from "@/features/crm/actions";
import { createProposal, updateProposalStatus } from "@/features/proposals/actions";
import type { ActionState } from "@/lib/action-state";
import { PROPOSAL_STATUS_LABELS } from "@/lib/constants";
import { formatBRL, formatDateTime, toDatetimeLocal } from "@/lib/format";

type DealDetail = NonNullable<Awaited<ReturnType<typeof getDealDetail>>>;

export function DealDetailDialog({
  dealId,
  onClose,
  onChanged,
}: {
  dealId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [losing, setLosing] = useState(false);

  const refetch = useCallback(() => {
    if (!dealId) return;
    getDealDetail(dealId).then((d) => setDeal(d ?? null));
  }, [dealId]);

  useEffect(() => {
    if (!dealId) {
      setDeal(null);
      return;
    }
    setLoading(true);
    getDealDetail(dealId)
      .then((d) => setDeal(d ?? null))
      .finally(() => setLoading(false));
  }, [dealId]);

  // O fetch do detalhe é feito à parte (client-side), não como parte da árvore
  // RSC — então o refresh automático que os Server Actions já disparam pra
  // formulários da página NÃO alcança esse estado local. Cada ação chamada
  // daqui precisa re-buscar o detalhe explicitamente depois de concluir.
  const boundUpdateDetails = deal
    ? async (state: ActionState, formData: FormData) => {
        const result = await updateDealDetails(deal.id, state, formData);
        if (result.ok) refetch();
        return result;
      }
    : null;
  const boundAddNote = deal
    ? async (state: ActionState, formData: FormData) => {
        const result = await addDealNote(deal.id, state, formData);
        if (result.ok) refetch();
        return result;
      }
    : null;

  return (
    <>
      <Dialog open={!!dealId} onClose={onClose} title={deal?.title ?? deal?.client.name ?? "Negócio"}>
        {loading && <p className="text-sm text-muted">Carregando…</p>}

        {deal && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/admin/clientes/${deal.client.id}`}
                className="text-sm text-accent-ink hover:underline"
              >
                {deal.client.name} {deal.client.phone && `· ${deal.client.phone}`}
              </Link>
              <Badge tone="accent">{deal.stage.name}</Badge>
            </div>

            {deal.properties.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs uppercase tracking-wide text-muted">
                  Imóveis de interesse
                </p>
                <ul className="flex flex-wrap gap-2">
                  {deal.properties.map((dp) => (
                    <li key={dp.propertyId}>
                      <Link
                        href={`/admin/imoveis/${dp.property.id}`}
                        className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-2"
                      >
                        {dp.property.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {deal.sale ? (
              <div className="rounded-md border border-ok/40 bg-ok/10 p-3 text-sm">
                <p className="font-medium">Venda registrada</p>
                <p>
                  {formatBRL(deal.sale.saleValue)} em {formatDateTime(deal.sale.saleDate)}
                  {deal.sale.commissionValue != null &&
                    ` · comissão ${formatBRL(deal.sale.commissionValue)}`}
                </p>
              </div>
            ) : (
              !deal.stage.isLost && (
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => setClosing(true)}>
                    Fechar venda
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setLosing(true)}>
                    Marcar como perdido
                  </Button>
                </div>
              )
            )}

            {deal.lostReason && (
              <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
                Perdido: {deal.lostReason}
              </p>
            )}

            {boundUpdateDetails && (
              <DealDetailsForm deal={deal} action={boundUpdateDetails} />
            )}

            <ProposalsSection deal={deal} refetch={refetch} />

            {boundAddNote && (
              <ClientTimeline activities={deal.activities} addNoteAction={boundAddNote} />
            )}
          </div>
        )}
      </Dialog>

      {deal && (
        <CloseDealDialog
          open={closing}
          onClose={() => setClosing(false)}
          dealId={deal.id}
          properties={deal.properties.map((dp) => dp.property)}
          onSuccess={() => {
            setClosing(false);
            onChanged();
            onClose();
          }}
        />
      )}
      {deal && (
        <LoseDealDialog
          open={losing}
          onClose={() => setLosing(false)}
          dealId={deal.id}
          onSuccess={() => {
            setLosing(false);
            onChanged();
            onClose();
          }}
        />
      )}
    </>
  );
}

function DealDetailsForm({
  deal,
  action,
}: {
  deal: DealDetail;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {
    ok: false,
  });

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">
        Próxima ação
      </p>
      <div className="flex flex-wrap gap-3 [&>*]:min-w-[10rem] [&>*]:flex-1">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nota</span>
          <input
            name="nextActionNote"
            defaultValue={deal.nextActionNote ?? ""}
            className="h-10 rounded-md border border-line bg-bg px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Quando</span>
          <input
            name="nextActionAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(deal.nextActionAt)}
            className="h-10 rounded-md border border-line bg-bg px-3"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Tags (uma por linha)</span>
        <textarea
          name="tags"
          rows={2}
          defaultValue={deal.tags.join("\n")}
          className="rounded-md border border-line bg-bg px-3 py-2"
        />
      </label>
      <input type="hidden" name="title" value={deal.title ?? ""} />
      <input type="hidden" name="estimatedValue" value={deal.estimatedValue ?? ""} />
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="self-start">
        {pending ? "Salvando…" : "Salvar"}
      </Button>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

function ProposalsSection({ deal, refetch }: { deal: DealDetail; refetch: () => void }) {
  const wrappedCreateProposal = async (state: ActionState, formData: FormData) => {
    const result = await createProposal(state, formData);
    if (result.ok) refetch();
    return result;
  };
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    wrappedCreateProposal,
    { ok: false },
  );

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">Propostas</p>

      {deal.proposals.length > 0 && (
        <ul className="flex flex-col gap-2">
          {deal.proposals.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {formatBRL(p.value)} — {p.property.title} · {formatDateTime(p.proposedAt)}
              </span>
              <form
                action={async (fd) => {
                  await updateProposalStatus(p.id, fd);
                  refetch();
                }}
                className="flex items-center gap-2"
              >
                <select
                  key={p.status}
                  name="status"
                  defaultValue={p.status}
                  className="h-8 rounded-md border border-line bg-bg px-2 text-xs"
                >
                  {Object.entries(PROPOSAL_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="ghost">
                  Atualizar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {deal.properties.length > 0 && (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="dealId" value={deal.id} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Imóvel</span>
            <select
              name="propertyId"
              className="h-9 rounded-md border border-line bg-bg px-2 text-sm"
            >
              {deal.properties.map((dp) => (
                <option key={dp.propertyId} value={dp.propertyId}>
                  {dp.property.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Valor ofertado</span>
            <input
              name="value"
              type="number"
              step="any"
              className="h-9 w-32 rounded-md border border-line bg-bg px-2 text-sm"
            />
          </label>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Salvando…" : "Registrar proposta"}
          </Button>
          {state.error && <p className="text-xs text-danger">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
