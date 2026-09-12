"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSearchAlert, type AlertState } from "@/features/alerts/actions";
import { ALERT_CONSENT_TEXT } from "@/features/alerts/schema";

const initial: AlertState = { ok: false };

/**
 * Botão "Criar alerta" da barra de filtros. Salva os filtros aplicados
 * na busca atual (bairro, tipo, preço, quartos) como critério do alerta —
 * sem precisar reescrevê-los no formulário.
 */
export function CreateAlertButton() {
  const [open, setOpen] = useState(false);
  const sp = useSearchParams();
  const [state, formAction, pending] = useActionState(createSearchAlert, initial);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 rounded-full"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        Criar alerta
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-10 w-72 rounded-2xl border border-line bg-surface p-4 shadow-lg">
          {state.ok ? (
            <p className="text-sm">
              ✓ Alerta criado! Avisamos por e-mail quando surgir um imóvel assim.
            </p>
          ) : (
            <form action={formAction} className="flex flex-col gap-3">
              <input type="hidden" name="district" value={sp.get("bairro") ?? ""} />
              <input type="hidden" name="kind" value={sp.get("tipo") ?? ""} />
              <input type="hidden" name="minPrice" value={sp.get("min") ?? ""} />
              <input type="hidden" name="maxPrice" value={sp.get("max") ?? ""} />
              <input type="hidden" name="minBedrooms" value={sp.get("quartos") ?? ""} />

              <p className="text-sm font-medium">Avise-me de imóveis assim</p>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-muted">E-mail</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="h-10 rounded-xl border border-line bg-bg px-3 text-sm"
                />
                {state.fieldErrors?.email && (
                  <span className="text-xs text-danger">{state.fieldErrors.email[0]}</span>
                )}
              </label>
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" name="consent" required className="mt-0.5" />
                {ALERT_CONSENT_TEXT}
              </label>
              {state.fieldErrors?.consent && (
                <span className="text-xs text-danger">{state.fieldErrors.consent[0]}</span>
              )}
              <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
                {pending ? "Salvando…" : "Criar alerta"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
