import type { Metadata } from "next";

import { PropertyCard } from "@/components/public/property-card";
import { listPublicProperties } from "@/features/properties/queries";

export const metadata: Metadata = {
  title: "Imóveis à venda",
  description:
    "Catálogo de casas e apartamentos à venda selecionados pela Avança Imóveis.",
  alternates: { canonical: "/imoveis" },
};

// Revalida periodicamente — catálogo é conteúdo mayormente estático.
export const revalidate = 300;

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const properties = await listPublicProperties({
    district: sp.bairro || undefined,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    minBedrooms: sp.quartos ? Number(sp.quartos) : undefined,
  }).catch(() => []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-ink">
          Catálogo
        </p>
        <h1 className="text-3xl">Imóveis à venda</h1>
        <p className="max-w-prose text-muted">
          Seleção atual da Avança Imóveis. Fale com a equipe para agendar uma visita.
        </p>
      </header>

      <form className="flex flex-wrap gap-3 rounded-card border border-line bg-surface p-4">
        <input
          name="bairro"
          defaultValue={sp.bairro}
          placeholder="Bairro"
          className="h-10 min-w-[10rem] flex-1 rounded-md border border-line bg-bg px-3 text-sm"
        />
        <input
          name="min"
          defaultValue={sp.min}
          inputMode="numeric"
          placeholder="Preço mín."
          className="h-10 w-32 rounded-md border border-line bg-bg px-3 text-sm"
        />
        <input
          name="max"
          defaultValue={sp.max}
          inputMode="numeric"
          placeholder="Preço máx."
          className="h-10 w-32 rounded-md border border-line bg-bg px-3 text-sm"
        />
        <select
          name="quartos"
          defaultValue={sp.quartos ?? ""}
          className="h-10 rounded-md border border-line bg-bg px-3 text-sm"
        >
          <option value="">Quartos</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent-ink"
        >
          Filtrar
        </button>
      </form>

      {properties.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhum imóvel disponível com esses filtros no momento.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
