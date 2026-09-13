"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * "Voltar" sobre a galeria, só no celular — diferente de tocar em "Imóveis"
 * no menu (que abre o catálogo sem filtro nenhum), isso volta pra página
 * anterior preservando a busca/filtro que a pessoa já tinha aplicado.
 */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Voltar"
      onClick={() => router.back()}
      className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-bg/90 text-ink shadow-sm backdrop-blur sm:hidden"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
