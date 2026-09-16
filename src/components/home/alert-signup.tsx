"use client";

import { useActionState } from "react";
import { BellRing } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import { createSearchAlert, type AlertState } from "@/features/alerts/actions";
import { ALERT_CONSENT_TEXT } from "@/features/alerts/schema";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";

const initial: AlertState = { ok: false };

/**
 * Captura de lead pra quem ainda não achou "o imóvel" — não é o formulário
 * de uma página específica (esse já existe em cada imóvel), é uma segunda
 * chance na home pra quem só está navegando: em vez de sair do site sem
 * deixar contato, deixa o e-mail e a gente avisa quando aparecer algo.
 */
export function AlertSignup() {
  const [state, formAction, pending] = useActionState(createSearchAlert, initial);

  return (
    <section className="border-t border-line">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-ink">
            <BellRing className="h-5 w-5" />
          </span>
          <h2 className="text-3xl sm:text-4xl">Ainda não encontrou o seu?</h2>
          <p className="max-w-md text-base leading-relaxed text-muted">
            Deixe seu e-mail e o tipo de imóvel que procura — avisamos assim que
            surgir algo com essas características, antes de virar anúncio público.
          </p>

          {state.ok ? (
            <p className="rounded-full bg-ok/10 px-5 py-2.5 text-sm font-medium text-ok">
              ✓ Alerta criado! Vamos avisar por e-mail assim que surgir algo assim.
            </p>
          ) : (
            <form action={formAction} className="flex w-full max-w-md flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  name="kind"
                  defaultValue=""
                  className="h-12 rounded-full border border-line bg-surface px-4 text-sm text-ink outline-none sm:w-40"
                >
                  <option value="">Qualquer tipo</option>
                  {Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Seu e-mail"
                  className="h-12 flex-1 rounded-full border border-line bg-surface px-4 text-sm text-ink outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="flex h-12 shrink-0 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? "Enviando…" : "Avise-me"}
                </button>
              </div>
              {state.fieldErrors?.email && (
                <span className="text-xs text-danger">{state.fieldErrors.email[0]}</span>
              )}
              <label className="flex items-start gap-2 text-left text-xs text-muted">
                <input type="checkbox" name="consent" required className="mt-0.5" />
                {ALERT_CONSENT_TEXT}
              </label>
              {state.fieldErrors?.consent && (
                <span className="text-xs text-danger">{state.fieldErrors.consent[0]}</span>
              )}
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
