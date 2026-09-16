"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { formatDateTime } from "@/lib/format";

type TimelineActivity = {
  id: string;
  kind: string;
  body: string;
  createdAt: string | Date;
  author: { id: string; name: string } | null;
};

const KIND_LABELS: Record<string, string> = {
  nota: "Nota",
  ligacao: "Ligação",
  email: "E-mail",
  whatsapp: "WhatsApp",
  mudanca_etapa: "Mudança de etapa",
  visita: "Visita",
};

export function ClientTimeline({
  activities,
  addNoteAction,
}: {
  activities: TimelineActivity[];
  addNoteAction: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addNoteAction,
    { ok: false },
  );

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">
        Linha do tempo
      </p>

      <form action={formAction} className="flex flex-col gap-2">
        <textarea
          name="body"
          rows={2}
          placeholder="Adicionar nota…"
          className="rounded-md border border-line bg-bg px-3 py-2 text-sm"
        />
        {state.fieldErrors?.body && (
          <span className="text-xs text-danger">{state.fieldErrors.body[0]}</span>
        )}
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Salvando…" : "Adicionar nota"}
        </Button>
      </form>

      {activities.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma atividade registrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {activities.map((a) => (
            <li key={a.id} className="border-t border-line pt-3 text-sm first:border-0 first:pt-0">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{KIND_LABELS[a.kind] ?? a.kind}</span>
                <span>{formatDateTime(a.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{a.body}</p>
              {a.author && (
                <p className="mt-1 text-xs text-muted">por {a.author.name}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
