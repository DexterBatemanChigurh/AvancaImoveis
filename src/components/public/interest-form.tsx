"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { submitInterest, type InterestState } from "@/features/leads/actions";
import { CONSENT_TEXT } from "@/features/leads/schema";

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
      <Field label="Nome" name="name" errors={state.fieldErrors?.name} required />
      <Field
        label="Telefone / WhatsApp"
        name="phone"
        errors={state.fieldErrors?.phone}
        required
      />
      <Field label="E-mail" name="email" type="email" errors={state.fieldErrors?.email} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Mensagem</span>
        <textarea
          name="message"
          rows={3}
          className="rounded-2xl border border-line bg-bg px-3.5 py-2.5"
          placeholder="Tenho interesse neste imóvel."
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="similarAlerts" className="mt-0.5" />
        <span>Avise-me por e-mail quando surgir um imóvel parecido com este.</span>
      </label>

      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="consent" className="mt-0.5" required />
        <span>{CONSENT_TEXT}</span>
      </label>
      {state.fieldErrors?.consent && (
        <p className="text-xs text-danger">{state.fieldErrors.consent[0]}</p>
      )}
      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Enviando…" : "Tenho interesse"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
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
        required={required}
        className="h-11 rounded-2xl border border-line bg-bg px-3.5"
      />
      {errors && <span className="text-xs text-danger">{errors[0]}</span>}
    </label>
  );
}
