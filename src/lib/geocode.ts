import "server-only";

import { env } from "@/lib/env";

/**
 * Geocodificação via Nominatim (OpenStreetMap) — sem chave, sem custo.
 * Usada no cadastro do imóvel para obter lat/long a partir do endereço.
 * Respeite o uso justo: no máximo 1 req/s e User-Agent identificável.
 */
export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const res = await fetch(url, {
    headers: {
      "User-Agent": `avanca-imoveis (${env.NEXT_PUBLIC_SITE_URL})`,
      "Accept-Language": "pt-BR",
    },
    // cache por endereço — evita bater no serviço à toa
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  const first = data[0];
  if (!first) return null;

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name,
  };
}

/**
 * Geocodifica tentando do endereço mais completo até o mais genérico.
 * Necessário na prática: o OpenStreetMap raramente tem o nº do imóvel
 * cadastrado em cidades pequenas, e às vezes nem o logradouro — mas
 * bairro/cidade quase sempre resolve, então o pino nunca fica "no nada".
 */
export async function geocodeAddressCascade(parts: {
  street?: string | null;
  number?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
}): Promise<GeocodeResult | null> {
  const { street, number, district, city, state } = parts;
  const candidates = [
    [street, number, district, city, state],
    [street, district, city, state],
    [street, city, state],
    [district, city, state],
    [city, state],
  ].map((p) => p.filter(Boolean).join(", "));

  const queries = [...new Set(candidates.filter(Boolean))];

  for (let i = 0; i < queries.length; i++) {
    const result = await geocodeAddress(queries[i]!);
    if (result) return result;
    // Respeita o limite de 1 req/s do Nominatim antes da próxima tentativa.
    if (i < queries.length - 1) await new Promise((r) => setTimeout(r, 1100));
  }
  return null;
}
