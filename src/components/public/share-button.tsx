"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Usa a Web Share API nativa quando disponível (celular, principalmente);
 * em desktop sem suporte, cai pra copiar o link e avisa com o texto do
 * próprio botão — sem precisar de toast/lib nova.
 *
 * `iconOnly` vira um badge circular igual ao FavoriteButton/BackButton —
 * pra usar flutuando sobre a foto, junto dos outros badges da galeria.
 */
export function ShareButton({
  title,
  url,
  className,
  iconOnly = false,
}: {
  title: string;
  url: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou o compartilhamento nativo — nada a fazer
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copiado" : "Compartilhar"}
      className={cn(
        iconOnly
          ? "grid h-8 w-8 place-items-center rounded-full bg-bg/90 shadow-sm backdrop-blur transition-transform hover:scale-105"
          : "flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink",
        className,
      )}
    >
      <Share2 className="h-4 w-4" />
      {!iconOnly && (copied ? "Link copiado!" : "Compartilhar")}
    </button>
  );
}
