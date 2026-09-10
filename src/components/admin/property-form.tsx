"use client";

import { useActionState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { Owner, Property } from "@/db/schema";
import {
  PROPERTY_KIND_LABELS,
  PROPERTY_STATUS_LABELS,
} from "@/lib/constants";

type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function PropertyForm({
  action,
  property,
  owners,
}: {
  action: Action;
  property?: Property;
  owners: Owner[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { ok: false },
  );
  const p = property;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {state.ok && (
        <p className="rounded-md border border-ok/40 bg-ok/10 p-3 text-sm">
          Alterações salvas.
        </p>
      )}
      {state.error && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
          {state.error}
        </p>
      )}

      <Fieldset legend="Identificação">
        <Row>
          <Text name="title" label="Título" defaultValue={p?.title} required
            errors={state.fieldErrors?.title} />
          <Text name="code" label="Código interno" defaultValue={p?.code} required
            errors={state.fieldErrors?.code} />
        </Row>
        <Row>
          <Select name="status" label="Status" defaultValue={p?.status ?? "rascunho"}
            options={Object.entries(PROPERTY_STATUS_LABELS)} />
          <Select name="kind" label="Tipo" defaultValue={p?.kind ?? "casa"}
            options={Object.entries(PROPERTY_KIND_LABELS)} />
        </Row>
      </Fieldset>

      <Fieldset legend="Valores">
        <Row>
          <Text name="salePrice" label="Valor de venda (R$)" type="number"
            defaultValue={p?.salePrice ?? ""} required
            errors={state.fieldErrors?.salePrice} />
          <Text name="condoFee" label="Condomínio (R$)" type="number"
            defaultValue={p?.condoFee ?? ""} />
          <Text name="iptuYearly" label="IPTU/ano (R$)" type="number"
            defaultValue={p?.iptuYearly ?? ""} />
        </Row>
      </Fieldset>

      <Fieldset legend="Endereço">
        <Row>
          <Text name="street" label="Logradouro" defaultValue={p?.street ?? ""} />
          <Text name="number" label="Número" defaultValue={p?.number ?? ""} />
        </Row>
        <Row>
          <Text name="district" label="Bairro" defaultValue={p?.district ?? ""} />
          <Text name="city" label="Cidade" defaultValue={p?.city ?? ""} />
          <Text name="state" label="UF" defaultValue={p?.state ?? ""} />
          <Text name="zipCode" label="CEP" defaultValue={p?.zipCode ?? ""} />
        </Row>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="hideExactAddress"
            defaultChecked={p?.hideExactAddress ?? false} />
          Ocultar endereço exato no catálogo (mostra só o bairro)
        </label>
      </Fieldset>

      <Fieldset legend="Características">
        <Row>
          <Text name="bedrooms" label="Quartos" type="number" defaultValue={p?.bedrooms ?? 0} />
          <Text name="suites" label="Suítes" type="number" defaultValue={p?.suites ?? 0} />
          <Text name="bathrooms" label="Banheiros" type="number" defaultValue={p?.bathrooms ?? 0} />
          <Text name="parkingSpots" label="Vagas" type="number" defaultValue={p?.parkingSpots ?? 0} />
        </Row>
        <Row>
          <Text name="usableArea" label="Área útil (m²)" type="number" defaultValue={p?.usableArea ?? ""} />
          <Text name="totalArea" label="Área total (m²)" type="number" defaultValue={p?.totalArea ?? ""} />
        </Row>
      </Fieldset>

      <Fieldset legend="Descrição e listas">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Descrição</span>
          <textarea name="description" rows={5} defaultValue={p?.description ?? ""}
            className="rounded-md border border-line bg-bg px-3 py-2" />
        </label>
        <Lines name="features" label="Características (uma por linha)"
          defaultValue={p?.features ?? []} />
        <Lines name="highlights" label="Diferenciais (uma por linha)"
          defaultValue={p?.highlights ?? []} />
        <Lines name="neighborhood" label="Na região (uma por linha)"
          defaultValue={p?.neighborhood ?? []} />
      </Fieldset>

      <Fieldset legend="Captação (interno)">
        <Row>
          <Select name="ownerId" label="Proprietário" defaultValue={p?.ownerId ?? ""}
            options={[["", "—"], ...owners.map((o) => [o.id, o.name] as [string, string])]} />
          <Select name="listingType" label="Tipo de captação" defaultValue={p?.listingType ?? ""}
            options={[["", "—"], ["exclusiva", "Exclusiva"], ["aberta", "Aberta"]]} />
        </Row>
        <Row>
          <Text name="listingStart" label="Início do contrato" type="date"
            defaultValue={p?.listingStart ?? ""} />
          <Text name="listingEnd" label="Fim do contrato" type="date"
            defaultValue={p?.listingEnd ?? ""} />
          <Text name="commissionPct" label="Comissão (%)" type="number"
            defaultValue={p?.commissionPct ?? ""} />
        </Row>
      </Fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : property ? "Salvar alterações" : "Criar imóvel"}
        </Button>
      </div>
    </form>
  );
}

/* --------------------------- campos auxiliares --------------------------- */

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <legend className="px-1 font-mono text-xs uppercase tracking-wide text-muted">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-4 [&>*]:min-w-[8rem] [&>*]:flex-1">{children}</div>;
}

function Text({
  name,
  label,
  type = "text",
  defaultValue,
  required,
  errors,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        defaultValue={defaultValue}
        required={required}
        className="h-10 rounded-md border border-line bg-bg px-3"
      />
      {errors && <span className="text-xs text-danger">{errors[0]}</span>}
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-line bg-bg px-3"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Textarea "uma por linha". O Server Action separa por quebra de linha
 * (ver parseForm em features/properties/actions.ts).
 */
function Lines({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue.join("\n")}
        className="rounded-md border border-line bg-bg px-3 py-2"
      />
    </label>
  );
}
