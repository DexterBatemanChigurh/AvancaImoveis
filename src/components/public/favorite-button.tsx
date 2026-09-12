"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({
  propertyId,
  className,
}: {
  propertyId: string;
  className?: string;
}) {
  const { isFavorite, toggle, ready } = useFavorites();
  const active = ready && isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Salvar nos favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full bg-bg/90 shadow-sm backdrop-blur transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart
        className={cn("h-5 w-5 transition-colors", active ? "fill-ink text-ink" : "text-ink")}
      />
    </button>
  );
}
