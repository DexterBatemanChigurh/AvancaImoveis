"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DISPLAY_RADIUS_METERS } from "@/lib/geo-privacy";

/** Prévia estática (sem arrastar/zoom) da localização aproximada do imóvel.
 * `lat`/`lng` aqui já chegam deslocados (ver lib/geo-privacy.ts) — nunca o
 * ponto real. Mostra só um raio, nunca um pino, pra não sugerir precisão
 * que não existe. Usa o controle de atribuição padrão do Leaflet — pequeno,
 * no canto — em vez do widget de embed do próprio site openstreetmap.org,
 * que traz uma barra promocional (doação, termos) que não dá pra remover
 * por ser de outra origem (iframe cross-origin). */
export function PropertyMapLeaflet({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      // Sem um view inicial (center/zoom), o Leaflet não tem referência de
      // coordenadas nenhuma — fitBounds (chamado logo abaixo) precisa de
      // um estado de view já existente pra converter o círculo em zoom/
      // centro, senão quebra com "Cannot read properties of undefined".
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    const circle = L.circle([lat, lng], {
      radius: DISPLAY_RADIUS_METERS,
      color: "#111",
      weight: 2,
      fillColor: "#111",
      fillOpacity: 0.12,
    }).addTo(map);
    map.fitBounds(circle.getBounds());

    return () => {
      map.remove();
    };
  }, [lat, lng]);

  // "isolate": o Leaflet usa z-index internos altos (controles chegam a
  // 1000) sem isolar o próprio container num contexto de empilhamento —
  // sem isso, esses valores escapam e aparecem por cima de QUALQUER coisa
  // com z-index menor na página (ex.: o lightbox de fotos, z-50).
  return <div ref={containerRef} className="isolate h-full w-full" />;
}
