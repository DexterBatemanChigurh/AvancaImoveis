"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { closeDeal } from "@/features/crm/actions";
import type { ActionState } from "@/lib/action-state";

export function CloseDealDialog({
  open,
  onClose,
  dealId,
  properties,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  dealId: string;
  properties: { id: string; title: string }[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(closeDeal, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onClose={onClose} title="Fechar venda">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="dealId" value={dealId} />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Imóvel vendido *</span>
          <select
            name="propertyId"
            required
            className="h-10 rounded-md border border-line bg-bg px-3"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {state.fieldErrors?.propertyId && (
            <span className="text-xs text-danger">{state.fieldErrors.propertyId[0]}</span>
          )}
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Valor da venda (R$) *</span>
            <input
              name="saleValue"
              type="number"
              step="any"
              required
              className="h-10 rounded-md border border-line bg-bg px-3"
            />
            {state.fieldErrors?.saleValue && (
              <span className="text-xs text-danger">{state.fieldErrors.saleValue[0]}</span>
            )}
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Data da venda *</span>
            <input
              name="saleDate"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="h-10 rounded-md border border-line bg-bg px-3"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Comissão (%)</span>
          <input
            name="commissionPct"
            type="number"
            step="any"
            className="h-10 w-32 rounded-md border border-line bg-bg px-3"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Observações</span>
          <textarea
            name="notes"
            rows={3}
            className="rounded-md border border-line bg-bg px-3 py-2"
          />
        </label>

        {state.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Registrando…" : "Confirmar venda"}
        </Button>
      </form>
    </Dialog>
  );
}
