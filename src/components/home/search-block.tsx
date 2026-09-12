import { Search } from "lucide-react";

import { StateSelect } from "@/components/home/state-select";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";

const SELECT_CLASS =
  "h-11 rounded-full border border-line bg-bg px-4 text-sm text-ink outline-none";

/**
 * Pré-busca da home — só 2 campos (tipo + estado), bem mais enxuta que o
 * filtro completo de /imoveis. Só navega pro catálogo ao clicar em
 * "Pesquisar" (nada de auto-submit ao trocar um campo) — o resto do
 * refinamento (cidade, preço, quartos...) acontece lá dentro.
 */
export function SearchBlock() {
  return (
    <section className="relative z-10 mx-auto -mt-16 w-full max-w-2xl px-5 sm:-mt-20">
      <div className="rounded-3xl bg-ink px-6 py-8 text-bg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
        <p className="mb-6 text-lg font-medium sm:text-xl">Encontre o imóvel ideal</p>
        <form
          action="/imoveis"
          method="GET"
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <select name="tipo" defaultValue="" className={SELECT_CLASS}>
            <option value="">Tipo de imóvel</option>
            {Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <StateSelect />

          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-bg px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Pesquisar
          </button>
        </form>
      </div>
    </section>
  );
}
