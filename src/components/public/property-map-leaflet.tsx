"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function pinIcon() {
  return L.divIcon({
    className: "",
    html:
      '<span style="display:block;width:16px;height:16px;border-radius:9999px;' +
      'background:#111;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

/** Prévia estática (sem arrastar/zoom) da localização do imóvel. Usa o
 * controle de atribuição padrão do Leaflet — pequeno, no canto — em vez do
 * widget de embed do próprio site openstreetmap.org, que traz uma barra
 * promocional (doação, termos) que não dá pra remover por ser de outra
 * origem (iframe cross-origin). */
export function PropertyMapLeaflet({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
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
    L.marker([lat, lng], { icon: pinIcon(), interactive: false }).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="h-full w-full" />;
}
