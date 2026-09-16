import { Search } from "lucide-react";

import { StateSelect } from "@/components/home/state-select";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";

const SELECT_CLASS =
  "h-12 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-bg outline-none focus-visible:border-white/30";

/**
 * Pré-busca da home — só 2 campos (tipo + estado), bem mais enxuta que o
 * filtro completo de /imoveis. Só navega pro catálogo ao clicar em
 * "Pesquisar" (nada de auto-submit ao trocar um campo) — o resto do
 * refinamento (cidade, preço, quartos...) acontece lá dentro.
 * Usa --ink-2 (grafite) em vez do --ink puro do hero por trás — um segundo
 * tom de "preto" que diferencia esse painel flutuante de interface dos
 * blocos de alto impacto (hero, imóvel do mês, CTA final).
 */
export function SearchBlock() {
  return (
    <section className="relative z-10 mx-auto -mt-20 w-full max-w-3xl px-5 sm:-mt-24">
      <div className="rounded-brand bg-ink-2 px-6 py-8 text-bg shadow-[0_20px_45px_-20px_rgba(17,16,14,0.4)] sm:px-10 sm:py-10">
        <p className="mb-6 text-lg font-medium sm:text-xl">Encontre o imóvel ideal</p>
        <form
          action="/imoveis"
          method="GET"
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <select name="tipo" defaultValue="" className={SELECT_CLASS}>
            <option value="" className="text-ink">
              Tipo de imóvel
            </option>
            {Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="text-ink">
                {label}
              </option>
            ))}
          </select>

          <StateSelect />

          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-bg px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Pesquisar
          </button>
        </form>
      </div>
    </section>
  );
}
