"use client";

import {
  useActionState,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { LocationPicker } from "@/components/admin/location-picker";
import {
  Fieldset,
  Lines,
  Row,
  Select,
  Text,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import type { Owner, Property } from "@/db/schema";
import { PROPERTY_KIND_LABELS, PROPERTY_STATUS_LABELS } from "@/lib/constants";

type CepStatus = "idle" | "loading" | "found" | "not-found" | "error";

/** Formata "38200000" -> "38200-000" enquanto digita. */
function formatCep(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

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
  property?: Property & { owners?: { owner: Owner }[] };
  owners: Owner[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    { ok: false },
  );
  const p = property;
  const ownerIds = p?.owners?.map((po) => po.owner.id) ?? [];

  const streetRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");

  function handleCepChange(e: ChangeEvent<HTMLInputElement>) {
    e.target.value = formatCep(e.target.value);
    setCepStatus("idle");
  }

  async function handleCepBlur(e: FocusEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepStatus("not-found");
        return;
      }
      if (streetRef.current)
        streetRef.current.value = data.logradouro || streetRef.current.value;
      if (districtRef.current)
        districtRef.current.value = data.bairro || districtRef.current.value;
      if (cityRef.current) cityRef.current.value = data.localidade || "";
      if (stateRef.current) stateRef.current.value = data.uf || "";
      setCepStatus("found");
      numberRef.current?.focus();
    } catch {
      setCepStatus("error");
    }
  }

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
      {!state.ok && !state.error && state.fieldErrors && (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm">
          Não deu pra salvar — corrija os campos destacados abaixo.
        </p>
      )}

      <Fieldset legend="Identificação">
        <Row>
          <Text
            name="title"
            label="Título"
            defaultValue={p?.title}
            required
            errors={state.fieldErrors?.title}
          />
          <Text
            name="code"
            label="Código interno"
            defaultValue={p?.code}
            required
            errors={state.fieldErrors?.code}
          />
        </Row>
        <Row>
          <Select
            name="status"
            label="Status"
            defaultValue={p?.status ?? "rascunho"}
            options={Object.entries(PROPERTY_STATUS_LABELS)}
          />
          <Select
            name="kind"
            label="Tipo"
            defaultValue={p?.kind ?? "casa"}
            options={Object.entries(PROPERTY_KIND_LABELS)}
          />
        </Row>
      </Fieldset>

      <Fieldset legend="Valores">
        <Row>
          <Text
            name="salePrice"
            label="Valor de venda (R$)"
            type="number"
            defaultValue={p?.salePrice ?? ""}
            required
            errors={state.fieldErrors?.salePrice}
          />
          <Text
            name="condoFee"
            label="Condomínio (R$)"
            type="number"
            defaultValue={p?.condoFee ?? ""}
            errors={state.fieldErrors?.condoFee}
          />
          <Text
            name="iptuYearly"
            label="IPTU/ano (R$)"
            type="number"
            defaultValue={p?.iptuYearly ?? ""}
            errors={state.fieldErrors?.iptuYearly}
          />
        </Row>
      </Fieldset>

      <Fieldset legend="Endereço">
        <Row>
          <Text
            name="zipCode"
            label="CEP"
            defaultValue={p?.zipCode ?? ""}
            placeholder="38200-000"
            onChange={handleCepChange}
            onBlur={handleCepBlur}
            errors={state.fieldErrors?.zipCode}
            hint={
              cepStatus === "loading"
                ? "Buscando endereço…"
                : cepStatus === "found"
                  ? "✓ Endereço preenchido — confira e complete o número."
                  : cepStatus === "not-found"
                    ? "CEP não encontrado, preencha manualmente."
                    : cepStatus === "error"
                      ? "Não consegui consultar o CEP agora, preencha manualmente."
                      : undefined
            }
          />
        </Row>
        <Row>
          <Text
            name="street"
            label="Logradouro"
            defaultValue={p?.street ?? ""}
            inputRef={streetRef}
            errors={state.fieldErrors?.street}
          />
          <Text
            name="number"
            label="Número"
            defaultValue={p?.number ?? ""}
            inputRef={numberRef}
            errors={state.fieldErrors?.number}
          />
        </Row>
        <Row>
          <Text
            name="district"
            label="Bairro"
            defaultValue={p?.district ?? ""}
            inputRef={districtRef}
            errors={state.fieldErrors?.district}
          />
          <Text
            name="city"
            label="Cidade"
            defaultValue={p?.city ?? ""}
            inputRef={cityRef}
            errors={state.fieldErrors?.city}
          />
          <Text
            name="state"
            label="UF"
            defaultValue={p?.state ?? ""}
            inputRef={stateRef}
            errors={state.fieldErrors?.state}
          />
        </Row>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hideExactAddress"
            defaultChecked={p?.hideExactAddress ?? false}
          />
          Ocultar endereço exato no catálogo (mostra só o bairro)
        </label>

        <div className="flex flex-col gap-2 rounded-md border border-line bg-surface-2 p-3">
          <p className="text-xs font-medium">Localização no mapa</p>
          <p className="text-xs text-muted">
            {p?.latitude != null && p?.longitude != null
              ? "Ajuste o pino se o endereço não caiu no lugar certo — muitas ruas de cidades menores não estão no mapa base, então o ponto pode sair aproximado."
              : "Ainda sem coordenada. Ao salvar, tentamos localizar pelo endereço automaticamente — ou clique no mapa abaixo pra marcar o ponto certo você mesmo."}
          </p>
          <LocationPicker
            defaultLat={p?.latitude ?? null}
            defaultLng={p?.longitude ?? null}
          />
          {(state.fieldErrors?.latitude || state.fieldErrors?.longitude) && (
            <p className="text-xs text-danger">
              {state.fieldErrors?.latitude?.[0] ||
                state.fieldErrors?.longitude?.[0]}
            </p>
          )}
          {p && (
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="forceGeocode" />
              Ignorar o pino acima e tentar localizar de novo pelo endereço ao
              salvar
            </label>
          )}
        </div>
      </Fieldset>

      <Fieldset legend="Características">
        <Row>
          <Text
            name="bedrooms"
            label="Quartos"
            type="number"
            defaultValue={p?.bedrooms ?? 0}
          />
          <Text
            name="suites"
            label="Suítes"
            type="number"
            defaultValue={p?.suites ?? 0}
          />
          <Text
            name="bathrooms"
            label="Banheiros"
            type="number"
            defaultValue={p?.bathrooms ?? 0}
          />
          <Text
            name="parkingSpots"
            label="Vagas"
            type="number"
            defaultValue={p?.parkingSpots ?? 0}
          />
        </Row>
        <Row>
          <Text
            name="usableArea"
            label="Área útil (m²)"
            type="number"
            defaultValue={p?.usableArea ?? ""}
            errors={state.fieldErrors?.usableArea}
          />
          <Text
            name="totalArea"
            label="Área total (m²)"
            type="number"
            defaultValue={p?.totalArea ?? ""}
            errors={state.fieldErrors?.totalArea}
          />
        </Row>
      </Fieldset>

      <Fieldset legend="Descrição e listas">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Descrição</span>
          <textarea
            name="description"
            rows={5}
            defaultValue={p?.description ?? ""}
            className="rounded-md border border-line bg-bg px-3 py-2"
          />
        </label>
        <Lines
          name="features"
          label="Características do imóvel (uma por linha)"
          defaultValue={p?.features ?? []}
        />
        <Lines
          name="condoFeatures"
          label="Características do condomínio (uma por linha)"
          defaultValue={p?.condoFeatures ?? []}
        />
        <Lines
          name="highlights"
          label="Diferenciais (uma por linha)"
          defaultValue={p?.highlights ?? []}
        />
        <Lines
          name="neighborhood"
          label="Na região (uma por linha)"
          defaultValue={p?.neighborhood ?? []}
        />
      </Fieldset>

      <Fieldset legend="Captação (interno)">
        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">
            Proprietário(s) — pode marcar mais de um
          </legend>
          {owners.length === 0 ? (
            <p className="text-xs text-muted">
              Nenhum proprietário cadastrado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {owners.map((o) => (
                <label key={o.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="ownerIds"
                    value={o.id}
                    defaultChecked={ownerIds.includes(o.id)}
                  />
                  {o.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <Row>
          <Select
            name="listingType"
            label="Tipo de captação"
            defaultValue={p?.listingType ?? ""}
            options={[
              ["", "—"],
              ["exclusiva", "Exclusiva"],
              ["aberta", "Aberta"],
            ]}
          />
        </Row>
        <Row>
          <Text
            name="listingStart"
            label="Início do contrato"
            type="date"
            defaultValue={p?.listingStart ?? ""}
          />
          <Text
            name="listingEnd"
            label="Fim do contrato"
            type="date"
            defaultValue={p?.listingEnd ?? ""}
          />
          <Text
            name="commissionPct"
            label="Comissão (%)"
            type="number"
            defaultValue={p?.commissionPct ?? ""}
            errors={state.fieldErrors?.commissionPct}
          />
        </Row>
      </Fieldset>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending
              ? "Salvando…"
              : property
                ? "Salvar alterações"
                : "Criar imóvel"}
          </Button>
        </div>
        {pending && (
          <p className="text-xs text-muted">
            Localizando o endereço no mapa — pode levar alguns segundos na
            primeira vez.
          </p>
        )}
      </div>
    </form>
  );
}
