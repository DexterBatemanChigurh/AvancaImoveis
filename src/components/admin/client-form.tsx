"use client";

import { useActionState } from "react";

import { Fieldset, Lines, Row, Select, Text } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { Client } from "@/db/schema";
import { LEAD_SOURCE_LABELS, PROPERTY_KIND_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/action-state";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ClientForm({
  action,
  client,
}: {
  action: Action;
  client?: Client;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { ok: false },
  );

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {state.error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
          {state.error}
        </p>
      )}

      <Fieldset legend="Dados do cliente">
        <Row>
          <Text
            name="name"
            label="Nome"
            defaultValue={client?.name}
            required
            errors={state.fieldErrors?.name}
          />
          <Select
            name="source"
            label="Origem"
            defaultValue={client?.source ?? "outro"}
            options={Object.entries(LEAD_SOURCE_LABELS)}
          />
        </Row>
        <Row>
          <Text name="phone" label="Telefone" defaultValue={client?.phone ?? ""} />
          <Text
            name="email"
            label="E-mail"
            type="email"
            defaultValue={client?.email ?? ""}
            errors={state.fieldErrors?.email}
          />
        </Row>
      </Fieldset>

      <Fieldset legend="Critérios de busca (alimentam o match imóvel ↔ cliente)">
        <Row>
          <Select
            name="kind"
            label="Tipo de imóvel"
            defaultValue={client?.kind ?? ""}
            options={[["", "Qualquer"], ...Object.entries(PROPERTY_KIND_LABELS)]}
          />
          <Text name="city" label="Cidade" defaultValue={client?.city ?? ""} />
        </Row>
        <Row>
          <Text
            name="budgetMin"
            label="Orçamento mín. (R$)"
            type="number"
            defaultValue={client?.budgetMin ?? undefined}
          />
          <Text
            name="budgetMax"
            label="Orçamento máx. (R$)"
            type="number"
            defaultValue={client?.budgetMax ?? undefined}
          />
          <Text
            name="minArea"
            label="Área mín. (m²)"
            type="number"
            defaultValue={client?.minArea ?? undefined}
          />
        </Row>
        <Row>
          <Text
            name="minBedrooms"
            label="Quartos (mín.)"
            type="number"
            defaultValue={client?.minBedrooms ?? undefined}
          />
          <Text
            name="minBathrooms"
            label="Banheiros (mín.)"
            type="number"
            defaultValue={client?.minBathrooms ?? undefined}
          />
          <Text
            name="minParkingSpots"
            label="Vagas (mín.)"
            type="number"
            defaultValue={client?.minParkingSpots ?? undefined}
          />
        </Row>
        <Lines
          name="districts"
          label="Bairros de interesse (um por linha)"
          defaultValue={client?.districts ?? []}
        />
        <Lines
          name="desiredFeatures"
          label="Características desejadas (uma por linha)"
          defaultValue={client?.desiredFeatures ?? []}
        />
      </Fieldset>

      <Fieldset legend="Observações">
        <textarea
          name="notes"
          rows={4}
          defaultValue={client?.notes ?? ""}
          className="rounded-md border border-line bg-bg px-3 py-2"
        />
      </Fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : client ? "Salvar alterações" : "Criar cliente"}
      </Button>
    </form>
  );
}
