"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useFavorites } from "@/lib/favorites";

export function FavoritesNavLink() {
  const { ids, ready } = useFavorites();
  const count = ready ? ids.length : 0;

  return (
    <Link
      href="/favoritos"
      aria-label="Favoritos"
      className="relative grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface-2"
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-[10px] font-semibold text-bg">
          {count}
        </span>
      )}
    </Link>
  );
}
