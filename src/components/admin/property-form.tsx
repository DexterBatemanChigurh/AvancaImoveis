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

function numOrEmpty(n: number | null | undefined) {
  return n == null ? "" : String(n);
}

type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

type FormValues = {
  title: string;
  code: string;
  status: string;
  kind: string;
  salePrice: string;
  condoFee: string;
  iptuYearly: string;
  zipCode: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parkingSpots: string;
  usableArea: string;
  totalArea: string;
  description: string;
  features: string;
  condoFeatures: string;
  highlights: string;
  neighborhood: string;
  ownerIds: string[];
  listingType: string;
  listingStart: string;
  listingEnd: string;
  commissionPct: string;
  forceGeocode: boolean;
};

function buildInitialValues(
  property?: Property & { owners?: { owner: Owner }[] },
): FormValues {
  const p = property;
  return {
    title: p?.title ?? "",
    code: p?.code ?? "",
    status: p?.status ?? "rascunho",
    kind: p?.kind ?? "casa",
    salePrice: numOrEmpty(p?.salePrice),
    condoFee: numOrEmpty(p?.condoFee),
    iptuYearly: numOrEmpty(p?.iptuYearly),
    zipCode: p?.zipCode ?? "",
    street: p?.street ?? "",
    number: p?.number ?? "",
    district: p?.district ?? "",
    city: p?.city ?? "",
    state: p?.state ?? "",
    bedrooms: String(p?.bedrooms ?? 0),
    suites: String(p?.suites ?? 0),
    bathrooms: String(p?.bathrooms ?? 0),
    parkingSpots: String(p?.parkingSpots ?? 0),
    usableArea: numOrEmpty(p?.usableArea),
    totalArea: numOrEmpty(p?.totalArea),
    description: p?.description ?? "",
    features: (p?.features ?? []).join("\n"),
    condoFeatures: (p?.condoFeatures ?? []).join("\n"),
    highlights: (p?.highlights ?? []).join("\n"),
    neighborhood: (p?.neighborhood ?? []).join("\n"),
    ownerIds: p?.owners?.map((po) => po.owner.id) ?? [],
    listingType: p?.listingType ?? "",
    listingStart: p?.listingStart ?? "",
    listingEnd: p?.listingEnd ?? "",
    commissionPct: numOrEmpty(p?.commissionPct),
    forceGeocode: false,
  };
}

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

  /**
   * Todos os campos do formulário moram nesse único estado controlado — de
   * propósito, não é só estilo. Um <form action={formAction}> ligado a
   * useActionState faz o React resetar os inputs NÃO controlados (os que só
   * têm defaultValue) toda vez que a action retorna, mesmo quando ela não
   * lança erro — ou seja, mesmo num retorno de validação `{ ok: false,
   * fieldErrors }`. Isso é o motivo real de o formulário aparecer "limpo"
   * depois de um erro: não é o servidor nem a Server Action que apagam nada,
   * é o próprio React devolvendo o DOM ao defaultValue original. Um input
   * controlado (value + onChange, como já era o caso de latitude/longitude
   * no LocationPicker) não sofre esse reset porque o valor exibido sempre
   * vem do estado do React, não do DOM.
   */
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(property),
  );

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const numberRef = useRef<HTMLInputElement>(null);
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");

  function handleCepChange(e: ChangeEvent<HTMLInputElement>) {
    set("zipCode", formatCep(e.target.value));
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
      setValues((v) => ({
        ...v,
        street: data.logradouro || v.street,
        district: data.bairro || v.district,
        city: data.localidade || "",
        state: data.uf || "",
      }));
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
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            required
            errors={state.fieldErrors?.title}
          />
          <Text
            name="code"
            label="Código interno"
            value={values.code}
            onChange={(e) => set("code", e.target.value)}
            required
            errors={state.fieldErrors?.code}
          />
        </Row>
        <Row>
          <Select
            name="status"
            label="Status"
            value={values.status}
            onChange={(e) => set("status", e.target.value)}
            options={Object.entries(PROPERTY_STATUS_LABELS)}
          />
          <Select
            name="kind"
            label="Tipo"
            value={values.kind}
            onChange={(e) => set("kind", e.target.value)}
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
            value={values.salePrice}
            onChange={(e) => set("salePrice", e.target.value)}
            required
            errors={state.fieldErrors?.salePrice}
          />
          <Text
            name="condoFee"
            label="Condomínio (R$)"
            type="number"
            value={values.condoFee}
            onChange={(e) => set("condoFee", e.target.value)}
            errors={state.fieldErrors?.condoFee}
          />
          <Text
            name="iptuYearly"
            label="IPTU/ano (R$)"
            type="number"
            value={values.iptuYearly}
            onChange={(e) => set("iptuYearly", e.target.value)}
            errors={state.fieldErrors?.iptuYearly}
          />
        </Row>
      </Fieldset>

      <Fieldset legend="Endereço">
        <Row>
          <Text
            name="zipCode"
            label="CEP"
            value={values.zipCode}
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
            value={values.street}
            onChange={(e) => set("street", e.target.value)}
            errors={state.fieldErrors?.street}
          />
          <Text
            name="number"
            label="Número"
            value={values.number}
            onChange={(e) => set("number", e.target.value)}
            inputRef={numberRef}
            errors={state.fieldErrors?.number}
          />
        </Row>
        <Row>
          <Text
            name="district"
            label="Bairro"
            value={values.district}
            onChange={(e) => set("district", e.target.value)}
            errors={state.fieldErrors?.district}
          />
          <Text
            name="city"
            label="Cidade"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            errors={state.fieldErrors?.city}
          />
          <Text
            name="state"
            label="UF"
            value={values.state}
            onChange={(e) => set("state", e.target.value)}
            errors={state.fieldErrors?.state}
          />
        </Row>
        <p className="text-xs text-muted">
          O endereço exato (rua/número) e a localização precisa no mapa nunca
          aparecem no catálogo público — só bairro/cidade e uma área
          aproximada. Isso vale pra todo imóvel, sem exceção.
        </p>

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
              <input
                type="checkbox"
                name="forceGeocode"
                checked={values.forceGeocode}
                onChange={(e) => set("forceGeocode", e.target.checked)}
              />
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
            value={values.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
          />
          <Text
            name="suites"
            label="Suítes"
            type="number"
            value={values.suites}
            onChange={(e) => set("suites", e.target.value)}
          />
          <Text
            name="bathrooms"
            label="Banheiros"
            type="number"
            value={values.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
          />
          <Text
            name="parkingSpots"
            label="Vagas"
            type="number"
            value={values.parkingSpots}
            onChange={(e) => set("parkingSpots", e.target.value)}
          />
        </Row>
        <Row>
          <Text
            name="usableArea"
            label="Área útil (m²)"
            type="number"
            value={values.usableArea}
            onChange={(e) => set("usableArea", e.target.value)}
            errors={state.fieldErrors?.usableArea}
          />
          <Text
            name="totalArea"
            label="Área total (m²)"
            type="number"
            value={values.totalArea}
            onChange={(e) => set("totalArea", e.target.value)}
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
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="rounded-md border border-line bg-bg px-3 py-2"
          />
        </label>
        <Lines
          name="features"
          label="Características do imóvel (uma por linha)"
          value={values.features}
          onChange={(e) => set("features", e.target.value)}
        />
        <Lines
          name="condoFeatures"
          label="Características do condomínio (uma por linha)"
          value={values.condoFeatures}
          onChange={(e) => set("condoFeatures", e.target.value)}
        />
        <Lines
          name="highlights"
          label="Diferenciais (uma por linha)"
          value={values.highlights}
          onChange={(e) => set("highlights", e.target.value)}
        />
        <Lines
          name="neighborhood"
          label="Na região (uma por linha)"
          value={values.neighborhood}
          onChange={(e) => set("neighborhood", e.target.value)}
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
                    checked={values.ownerIds.includes(o.id)}
                    onChange={(e) =>
                      set(
                        "ownerIds",
                        e.target.checked
                          ? [...values.ownerIds, o.id]
                          : values.ownerIds.filter((id) => id !== o.id),
                      )
                    }
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
            value={values.listingType}
            onChange={(e) => set("listingType", e.target.value)}
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
            value={values.listingStart}
            onChange={(e) => set("listingStart", e.target.value)}
          />
          <Text
            name="listingEnd"
            label="Fim do contrato"
            type="date"
            value={values.listingEnd}
            onChange={(e) => set("listingEnd", e.target.value)}
          />
          <Text
            name="commissionPct"
            label="Comissão (%)"
            type="number"
            value={values.commissionPct}
            onChange={(e) => set("commissionPct", e.target.value)}
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
