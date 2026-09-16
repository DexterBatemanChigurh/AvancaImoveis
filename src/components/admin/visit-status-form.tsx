"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { updateVisitStatus } from "@/features/visits/actions";
import type { ActionState } from "@/lib/action-state";
import { VISIT_STATUS_LABELS } from "@/lib/constants";

export function VisitStatusForm({ visitId }: { visitId: string }) {
  const action = updateVisitStatus.bind(null, visitId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { ok: false },
  );
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-accent-ink hover:underline"
      >
        Atualizar status
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border border-line bg-surface-2 p-3">
      <select
        name="status"
        defaultValue="realizada"
        className="h-8 rounded-md border border-line bg-bg px-2 text-sm"
      >
        {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <textarea
        name="feedback"
        rows={2}
        placeholder="Feedback (opcional)"
        className="rounded-md border border-line bg-bg px-2 py-1 text-sm"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
