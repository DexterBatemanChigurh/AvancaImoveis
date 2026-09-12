import { PropertyCard } from "@/components/public/property-card";
import type { Property, PropertyPhoto } from "@/db/schema";

type Item = Property & { photos: PropertyPhoto[] };

/**
 * Grade de resultados do catálogo. O mapa foi removido daqui a pedido —
 * continua existindo no formulário do admin (escolher o ponto do imóvel)
 * e na página do imóvel selecionado (localização + Street View).
 */
export function CatalogResults({
  properties,
  total,
}: {
  properties: Item[];
  /** Total de imóveis que batem com o filtro (não só os desta página). */
  total?: number;
}) {
  const count = total ?? properties.length;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        {count === 0
          ? "Nenhum imóvel disponível com esses filtros no momento."
          : `${count} imóvel${count > 1 ? "eis" : ""} disponível${count > 1 ? "eis" : ""}.`}
      </p>

      {properties.length === 0 ? (
        <p className="rounded-brand border border-dashed border-line p-10 text-center text-muted">
          Fale com a nossa equipe pelo WhatsApp — podemos ter algo que ainda não
          está no site.
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
