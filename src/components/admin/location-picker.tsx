"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("./location-picker-map").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-xl border border-line text-sm text-muted">
        Carregando mapa…
      </div>
    ),
  },
);

/**
 * Mapa clicável pra corrigir a localização à mão quando o endereço não
 * geocodifica bem (comum em cidades pequenas, onde o OpenStreetMap não tem
 * a rua cadastrada). Clique ou arraste o pino — os campos de latitude e
 * longitude abaixo acompanham, e são o que de fato vai no formulário.
 */
export function LocationPicker({
  defaultLat,
  defaultLng,
}: {
  defaultLat: number | null;
  defaultLng: number | null;
}) {
  const [lat, setLat] = useState<number | null>(defaultLat);
  const [lng, setLng] = useState<number | null>(defaultLng);

  return (
    <div className="flex flex-col gap-3">
      <LocationPickerMap
        lat={lat}
        lng={lng}
        onChange={(newLat, newLng) => {
          setLat(Number(newLat.toFixed(6)));
          setLng(Number(newLng.toFixed(6)));
        }}
      />
      <p className="text-xs text-muted">
        Clique no mapa ou arraste o pino pra ajustar o ponto exato. Os campos abaixo
        são preenchidos automaticamente e são o que realmente é salvo.
      </p>
      <div className="flex flex-wrap gap-4 [&>*]:min-w-[8rem] [&>*]:flex-1">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Latitude</span>
          <input
            name="latitude"
            type="number"
            step="any"
            value={lat ?? ""}
            onChange={(e) => setLat(e.target.value === "" ? null : Number(e.target.value))}
            className="h-10 rounded-md border border-line bg-bg px-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Longitude</span>
          <input
            name="longitude"
            type="number"
            step="any"
            value={lng ?? ""}
            onChange={(e) => setLng(e.target.value === "" ? null : Number(e.target.value))}
            className="h-10 rounded-md border border-line bg-bg px-3"
          />
        </label>
      </div>
    </div>
  );
}
