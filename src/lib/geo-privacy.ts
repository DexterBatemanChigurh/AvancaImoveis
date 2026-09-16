/**
 * O catálogo público nunca mostra a localização exata de um imóvel — nem
 * no mapa embutido, nem em links externos (Google Maps/Street View) que
 * apontem pra ela. Em vez do pino real, deslocamos a coordenada de forma
 * determinística (mesmo imóvel = mesmo deslocamento sempre, senão o mapa
 * "pularia" a cada carregamento) por até `JITTER_RADIUS_METERS`, e
 * mostramos um raio aproximado — nunca um marcador — centrado nesse ponto
 * deslocado.
 *
 * `DISPLAY_RADIUS_METERS` é maior que o deslocamento máximo de propósito:
 * garante que o ponto real do imóvel sempre caia dentro do círculo exibido,
 * então o raio nunca "mente" sobre onde o imóvel está, só evita apontar o
 * local exato.
 */
export const JITTER_RADIUS_METERS = 200;
export const DISPLAY_RADIUS_METERS = 400;

const METERS_PER_DEGREE_LAT = 111_320;

export function jitterCoordinate(
  lat: number,
  lng: number,
): { lat: number; lng: number } {
  const seed = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const angle = (hash % 360) * (Math.PI / 180);
  const distance = (((hash >>> 8) % 1000) / 1000) * JITTER_RADIUS_METERS;

  const dLat = (Math.sin(angle) * distance) / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180) || METERS_PER_DEGREE_LAT;
  const dLng = (Math.cos(angle) * distance) / metersPerDegreeLng;

  return { lat: lat + dLat, lng: lng + dLng };
}
