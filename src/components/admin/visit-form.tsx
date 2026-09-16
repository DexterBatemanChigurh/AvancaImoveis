"use client";

import { useActionState } from "react";

import { Row, Select, Text } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { createVisit } from "@/features/visits/actions";
import type { ActionState } from "@/lib/action-state";

export function VisitForm({
  clients,
  properties,
}: {
  clients: { id: string; name: string }[];
  properties: { id: string; title: string; code: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createVisit,
    { ok: false },
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4 rounded-card border border-line bg-surface p-5">
      {state.error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
          {state.error}
        </p>
      )}
      <Row>
        <Select
          name="clientId"
          label="Cliente"
          options={clients.map((c) => [c.id, c.name])}
        />
        <Select
          name="propertyId"
          label="Imóvel"
          options={properties.map((p) => [p.id, `${p.code} — ${p.title}`])}
        />
      </Row>
      <Text
        name="scheduledAt"
        label="Data e hora"
        type="datetime-local"
        required
        errors={state.fieldErrors?.scheduledAt}
      />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Agendando…" : "Agendar visita"}
      </Button>
    </form>
  );
}
