"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { loseDeal } from "@/features/crm/actions";
import type { ActionState } from "@/lib/action-state";

export function LoseDealDialog({
  open,
  onClose,
  dealId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  dealId: string;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loseDeal, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) onSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Dialog open={open} onClose={onClose} title="Marcar negócio como perdido">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="dealId" value={dealId} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Motivo *</span>
          <textarea
            name="lostReason"
            rows={3}
            required
            className="rounded-md border border-line bg-bg px-3 py-2"
          />
          {state.fieldErrors?.lostReason && (
            <span className="text-xs text-danger">{state.fieldErrors.lostReason[0]}</span>
          )}
        </label>
        {state.error && (
          <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
            {state.error}
          </p>
        )}
        <Button type="submit" variant="danger" disabled={pending}>
          {pending ? "Salvando…" : "Marcar como perdido"}
        </Button>
      </form>
    </Dialog>
  );
}
