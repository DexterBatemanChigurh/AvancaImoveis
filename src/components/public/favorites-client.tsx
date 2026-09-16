"use client";

import { useEffect, useState } from "react";

import { PropertyCard } from "@/components/public/property-card";
import type { PropertyPhoto } from "@/db/schema";
import type { PublicProperty } from "@/features/properties/queries";
import { useFavorites } from "@/lib/favorites";

type Item = PublicProperty & { photos: PropertyPhoto[] };

export function FavoritesClient() {
  const { ids, ready } = useFavorites();
  const [properties, setProperties] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (ids.length === 0) {
      setProperties([]);
      return;
    }
    fetch(`/api/properties/favoritos?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((data) => setProperties(data.properties ?? []))
      .catch(() => setProperties([]));
  }, [ready, ids]);

  if (!ready || properties === null) {
    return <p className="text-sm text-muted">Carregando…</p>;
  }

  if (properties.length === 0) {
    return (
      <p className="rounded-brand border border-dashed border-line p-10 text-center text-muted">
        Você ainda não salvou nenhum imóvel. Clique no coração em qualquer imóvel do
        catálogo para guardar aqui.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
