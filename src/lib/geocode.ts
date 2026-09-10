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
