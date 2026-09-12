import type { Metadata } from "next";

import { FavoritesClient } from "@/components/public/favorites-client";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return (
    <div className="container flex flex-col gap-6 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Favoritos
        </p>
        <h1 className="text-3xl sm:text-4xl">Seus imóveis salvos</h1>
        <p className="max-w-xl text-muted">
          Ficam guardados neste navegador — não precisa criar conta.
        </p>
      </div>
      <FavoritesClient />
    </div>
  );
}
