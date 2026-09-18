"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoritesNavLink({ overlay = false }: { overlay?: boolean }) {
  const { ids, ready } = useFavorites();
  const count = ready ? ids.length : 0;

  return (
    <Link
      href="/favoritos"
      aria-label="Favoritos"
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2/60",
        overlay ? "text-white hover:bg-white/10" : "text-ink",
      )}
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold",
            overlay ? "bg-white text-neutral-900" : "bg-ink text-bg",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
