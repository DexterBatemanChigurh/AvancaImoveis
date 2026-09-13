"use client";

import { useActionState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { submitInterest, type InterestState } from "@/features/leads/actions";
import { CONSENT_TEXT } from "@/features/leads/schema";

const SIMILAR_ALERTS_HINT =
  "Avise-me por e-mail quando surgir um imóvel parecido com este.";

const initial: InterestState = { ok: false };

export function InterestForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(submitInterest, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-sm">
        Recebemos seu contato. A equipe da Avança Imóveis vai te retornar em breve.
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="propertyId" value={propertyId} />

      <Field
        placeholder="Insira seu nome"
        name="name"
        errors={state.fieldErrors?.name}
        required
      />
      <Field
        placeholder="Insira seu e-mail"
        name="email"
        type="email"
        errors={state.fieldErrors?.email}
      />
      <Field
        placeholder="Insira seu telefone"
        name="phone"
        errors={state.fieldErrors?.phone}
        required
      />

      <textarea
        name="message"
        rows={3}
        placeholder="Mensagem"
        aria-label="Mensagem"
        className="rounded-2xl border border-line bg-bg px-4 py-3 text-sm placeholder:text-muted"
      />

      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          name="similarAlerts"
          className="h-4 w-4 rounded border-line accent-accent"
        />
        <span>Receber ofertas similares</span>
        <Info
          className="h-3.5 w-3.5 shrink-0 text-muted"
          aria-label={SIMILAR_ALERTS_HINT}
          role="img"
        >
          <title>{SIMILAR_ALERTS_HINT}</title>
        </Info>
      </label>

      <label className="flex items-start gap-2 text-xs text-muted">
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 h-4 w-4 rounded border-line accent-accent"
          required
        />
        <span>{CONSENT_TEXT}</span>
      </label>
      {state.fieldErrors?.consent && (
        <p className="text-xs text-danger">{state.fieldErrors.consent[0]}</p>
      )}
      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="h-14 rounded-full text-base">
        {pending ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  );
}

function Field({
  placeholder,
  name,
  type = "text",
  required,
  errors,
}: {
  placeholder: string;
  name: string;
  type?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-14 rounded-full border border-line bg-bg px-5 text-sm placeholder:text-muted"
      />
      {errors && <span className="px-1 text-xs text-danger">{errors[0]}</span>}
    </div>
  );
}
