"use client";

import { useActionState } from "react";

import { Fieldset, Lines, Row, Select, Text } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { createDeal } from "@/features/crm/actions";
import type { ActionState } from "@/lib/action-state";

export function DealForm({
  clients,
  properties,
}: {
  clients: { id: string; name: string }[];
  properties: { id: string; title: string; code: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createDeal,
    { ok: false },
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {state.error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
          {state.error}
        </p>
      )}

      <Fieldset legend="Negócio">
        <Select
          name="clientId"
          label="Cliente"
          options={clients.map((c) => [c.id, c.name])}
        />
        {state.fieldErrors?.clientId && (
          <span className="text-xs text-danger">{state.fieldErrors.clientId[0]}</span>
        )}
        <Row>
          <Text name="title" label="Título (opcional)" />
          <Text name="estimatedValue" label="Valor estimado (R$)" type="number" />
        </Row>
      </Fieldset>

      <Fieldset legend="Imóveis de interesse">
        {properties.length === 0 ? (
          <p className="text-xs text-muted">Nenhum imóvel cadastrado ainda.</p>
        ) : (
          <div className="flex flex-col gap-1.5 text-sm">
            {properties.map((p) => (
              <label key={p.id} className="flex items-center gap-2">
                <input type="checkbox" name="propertyIds" value={p.id} />
                {p.code} — {p.title}
              </label>
            ))}
          </div>
        )}
      </Fieldset>

      <Fieldset legend="Próxima ação">
        <Row>
          <Text name="nextActionNote" label="Nota" />
          <Text name="nextActionAt" label="Quando" type="datetime-local" />
        </Row>
        <Lines name="tags" label="Tags (uma por linha)" defaultValue={[]} />
      </Fieldset>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Criando…" : "Criar negócio"}
      </Button>
    </form>
  );
}
