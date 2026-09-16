import type { Client, Property } from "@/db/schema";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";

export type MatchCriterion = { label: string; met: boolean };
export type MatchResult = { score: number | null; criteria: MatchCriterion[] };

export type MatchClient = Pick<
  Client,
  | "kind"
  | "city"
  | "districts"
  | "budgetMin"
  | "budgetMax"
  | "minBedrooms"
  | "minBathrooms"
  | "minParkingSpots"
  | "minArea"
  | "desiredFeatures"
>;

export type MatchProperty = Pick<
  Property,
  | "kind"
  | "city"
  | "district"
  | "salePrice"
  | "bedrooms"
  | "bathrooms"
  | "parkingSpots"
  | "usableArea"
  | "totalArea"
  | "features"
  | "condoFeatures"
  | "highlights"
  | "neighborhood"
>;

function normalize(s: string) {
  return s.trim().toLowerCase();
}

/**
 * Compatibilidade cliente ↔ imóvel — calculada em memória, sob demanda, e
 * NUNCA persistida: um score salvo ficaria desatualizado no instante em que
 * o cliente ou o imóvel mudassem, o que seria pior do que não ter nenhum.
 *
 * Só entram na conta os critérios que o cliente de fato preencheu — um
 * campo vazio não conta a favor nem contra (por isso o score pode ser
 * `null`: cliente sem nenhum critério de busca cadastrado ainda).
 */
export function matchScore(
  client: MatchClient,
  property: MatchProperty,
): MatchResult {
  const criteria: MatchCriterion[] = [];

  if (client.kind) {
    criteria.push({
      label: `Tipo: ${PROPERTY_KIND_LABELS[client.kind]}`,
      met: property.kind === client.kind,
    });
  }
  if (client.city) {
    criteria.push({
      label: `Cidade: ${client.city}`,
      met: !!property.city && normalize(property.city) === normalize(client.city),
    });
  }
  if (client.districts.length > 0) {
    const wanted = client.districts.map(normalize);
    criteria.push({
      label: `Bairro: ${client.districts.join(", ")}`,
      met: !!property.district && wanted.includes(normalize(property.district)),
    });
  }
  if (client.budgetMin != null || client.budgetMax != null) {
    const min = client.budgetMin ?? -Infinity;
    const max = client.budgetMax ?? Infinity;
    criteria.push({
      label: "Dentro do orçamento",
      met: property.salePrice >= min && property.salePrice <= max,
    });
  }
  if (client.minBedrooms != null) {
    criteria.push({
      label: `${client.minBedrooms}+ quartos`,
      met: property.bedrooms >= client.minBedrooms,
    });
  }
  if (client.minBathrooms != null) {
    criteria.push({
      label: `${client.minBathrooms}+ banheiros`,
      met: property.bathrooms >= client.minBathrooms,
    });
  }
  if (client.minParkingSpots != null) {
    criteria.push({
      label: `${client.minParkingSpots}+ vagas`,
      met: property.parkingSpots >= client.minParkingSpots,
    });
  }
  if (client.minArea != null) {
    const area = property.usableArea ?? property.totalArea ?? 0;
    criteria.push({
      label: `Área mín. ${client.minArea}m²`,
      met: area >= client.minArea,
    });
  }
  if (client.desiredFeatures.length > 0) {
    const tags = new Set(
      [
        ...property.features,
        ...property.condoFeatures,
        ...property.highlights,
        ...property.neighborhood,
      ].map(normalize),
    );
    for (const feature of client.desiredFeatures) {
      criteria.push({ label: feature, met: tags.has(normalize(feature)) });
    }
  }

  if (criteria.length === 0) return { score: null, criteria: [] };

  const metCount = criteria.filter((c) => c.met).length;
  return { score: Math.round((metCount / criteria.length) * 100), criteria };
}
