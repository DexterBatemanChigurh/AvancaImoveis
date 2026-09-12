import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";

import { AutoSubmitForm } from "@/components/public/auto-submit-form";
import { CatalogResults } from "@/components/public/catalog-results";
import { CreateAlertButton } from "@/components/public/create-alert-button";
import { LocationFilter } from "@/components/public/location-filter";
import { Pagination } from "@/components/public/pagination";
import {
  CATALOG_PAGE_SIZE,
  listAvailableDistricts,
  listPublicProperties,
  type CatalogSort,
} from "@/features/properties/queries";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Imóveis à venda",
  description:
    "Catálogo de imóveis à venda da Avança Imóveis — oportunidades e investimento estratégico em Frutal, MG.",
  alternates: { canonical: "/imoveis" },
};

// Revalida periodicamente — catálogo é conteúdo majoritariamente estático.
export const revalidate = 300;

type SearchParams = Promise<Record<string, string | undefined>>;

const SORT_OPTIONS: [CatalogSort, string][] = [
  ["recentes", "Mais recentes"],
  ["menor-preco", "Menor preço"],
  ["maior-preco", "Maior preço"],
];

const COUNT_OPTIONS = ["1", "2", "3", "4"];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sort: CatalogSort =
    sp.ordenar === "menor-preco" || sp.ordenar === "maior-preco" ? sp.ordenar : "recentes";
  const kind = sp.tipo && sp.tipo in PROPERTY_KIND_LABELS
    ? (sp.tipo as keyof typeof PROPERTY_KIND_LABELS)
    : undefined;

  const page = sp.pagina && Number(sp.pagina) > 0 ? Number(sp.pagina) : 1;

  // "faixa" vem do bloco de busca da home (components/home/search-block.tsx):
  // um único select "min-max" codificado, pra não precisar de JS extra só
  // pra preencher dois campos. min/max explícitos (vindos do filtro normal
  // desta página) sempre têm prioridade sobre o valor de "faixa".
  const [faixaMin, faixaMax] = (sp.faixa ?? "").split("-");
  const minPrice = sp.min ?? faixaMin;
  const maxPrice = sp.max ?? faixaMax;

  const [catalog, districts] = await Promise.all([
    listPublicProperties({
      district: sp.bairro || undefined,
      city: sp.cidade || undefined,
      state: sp.uf || undefined,
      kind,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: sp.quartos ? Number(sp.quartos) : undefined,
      minBathrooms: sp.banheiros ? Number(sp.banheiros) : undefined,
      minParkingSpots: sp.vagas ? Number(sp.vagas) : undefined,
      sort,
      page,
    }).catch(() => ({ items: [], total: 0, page: 1, pageSize: CATALOG_PAGE_SIZE })),
    listAvailableDistricts({ city: sp.cidade, state: sp.uf }).catch(() => []),
  ]);
  const totalPages = Math.max(1, Math.ceil(catalog.total / catalog.pageSize));

  return (
    <div className="flex flex-col">
      <div className="container flex flex-col gap-2 pb-8 pt-14 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Catálogo completo
        </p>
        <h1 className="text-3xl sm:text-5xl">Imóveis à venda</h1>
      </div>

      <div className="border-y border-line bg-surface-2">
        <div className="container flex flex-col gap-3 py-4">
          <AutoSubmitForm className="flex flex-wrap items-center gap-2">
            <select
              name="tipo"
              defaultValue={sp.tipo ?? ""}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              <option value="">Tipo</option>
              {Object.entries(PROPERTY_KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <LocationFilter defaultUf={sp.uf} defaultCidade={sp.cidade} />
            <select
              name="bairro"
              defaultValue={sp.bairro ?? ""}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              <option value="">Todos os bairros</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              name="quartos"
              defaultValue={sp.quartos ?? ""}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              <option value="">Quartos</option>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
            <select
              name="banheiros"
              defaultValue={sp.banheiros ?? ""}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              <option value="">Banheiros</option>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
            <select
              name="vagas"
              defaultValue={sp.vagas ?? ""}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              <option value="">Vagas</option>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
            <input
              name="min"
              defaultValue={sp.min}
              inputMode="numeric"
              placeholder="Preço mín."
              className="h-10 w-28 rounded-full border border-line bg-bg px-3.5 text-sm outline-none placeholder:text-muted"
            />
            <input
              name="max"
              defaultValue={sp.max}
              inputMode="numeric"
              placeholder="Preço máx."
              className="h-10 w-28 rounded-full border border-line bg-bg px-3.5 text-sm outline-none placeholder:text-muted"
            />
            <select
              name="ordenar"
              defaultValue={sort}
              className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="ml-auto flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </AutoSubmitForm>
          <div className="flex justify-end">
            <Suspense fallback={null}>
              <CreateAlertButton />
            </Suspense>
          </div>
        </div>
      </div>

      <section className="container py-12 sm:py-16">
        <CatalogResults properties={catalog.items} total={catalog.total} />
        <Pagination
          page={catalog.page}
          totalPages={totalPages}
          basePath="/imoveis"
          searchParams={sp}
        />
      </section>
    </div>
  );
}
