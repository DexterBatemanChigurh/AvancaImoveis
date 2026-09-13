"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

/**
 * Número mascarado até o clique — evita que o telefone fique exposto pra
 * qualquer bot que raspe a página, só quem clica em "mostrar telefone" vê.
 */
export function PhoneReveal({ phone }: { phone: string }) {
  const [revealed, setRevealed] = useState(false);
  const masked = phone.length > 4 ? `${phone.slice(0, -4)}...` : phone;

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Phone className="h-4 w-4 shrink-0" />
      <span>{revealed ? phone : masked}</span>
      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-xs font-semibold text-ink underline underline-offset-4"
        >
          mostrar telefone
        </button>
      )}
    </div>
  );
}
