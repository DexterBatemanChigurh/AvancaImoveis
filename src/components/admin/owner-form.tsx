"use client";

import { useActionState } from "react";

import { Fieldset, Row, Text } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { Owner } from "@/db/schema";
import type { ActionState } from "@/lib/action-state";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function OwnerForm({
  action,
  owner,
}: {
  action: Action;
  owner?: Owner;
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

      <Fieldset legend="Proprietário">
        <Row>
          <Text
            name="name"
            label="Nome"
            defaultValue={owner?.name}
            required
            errors={state.fieldErrors?.name}
          />
          <Text
            name="document"
            label="CPF/CNPJ"
            defaultValue={owner?.document ?? ""}
          />
        </Row>
        <Row>
          <Text
            name="phone"
            label="Telefone"
            defaultValue={owner?.phone ?? ""}
          />
          <Text
            name="email"
            label="E-mail"
            type="email"
            defaultValue={owner?.email ?? ""}
            errors={state.fieldErrors?.email}
          />
        </Row>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Observações</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={owner?.notes ?? ""}
            className="rounded-md border border-line bg-bg px-3 py-2"
          />
        </label>
      </Fieldset>

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvando…"
          : owner
            ? "Salvar alterações"
            : "Criar proprietário"}
      </Button>
    </form>
  );
}
