"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { trackWhatsappClick } from "@/features/analytics/actions";

/**
 * Envolve QUALQUER link de WhatsApp do site público — mesmo comportamento
 * de um <a> normal, só registra o clique pro dashboard comercial antes de
 * deixar a navegação seguir (o link abre em nova aba, então não há nada
 * pra "esperar"; o registro nunca pode travar ou falhar visivelmente pro
 * visitante).
 */
export function WhatsappLink({
  propertyId,
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { propertyId?: string }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackWhatsappClick(propertyId).catch(() => {});
    onClick?.(e);
  }

  return <a {...props} target={target} rel={rel} onClick={handleClick} />;
}
