import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import type { Property } from "@/db/schema";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { publicUrl } from "@/lib/storage/url";

type CategoryOverview = {
  kind: Property["kind"];
  total: number;
  coverStorageKey: string | null;
};

// Cor de bloco reservada pra tile sem foto de capa ainda — mantém a
// categoria com peso visual/intencional em vez de um placeholder cinza.
const FALLBACK_BLOCK: Record<Property["kind"], string> = {
  casa: "bg-block-terracotta",
  apartamento: "bg-block-blue",
  terreno: "bg-accent-soft",
  comercial: "bg-block-yellow",
  outro: "bg-block-beige",
};

export function Categories({ categories }: { categories: CategoryOverview[] }) {
  const available = categories.filter((c) => c.total > 0);
  if (available.length === 0) return null;

  return (
    <section className="container py-24 sm:py-32">
      <Reveal className="mb-12 flex flex-col gap-2 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl">Categorias</h2>
        <p className="text-base text-muted">Encontre pelo tipo de imóvel que você procura.</p>
      </Reveal>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {available.map((cat, i) => {
          const hasPhoto = !!cat.coverStorageKey;
          return (
            <Reveal key={cat.kind} delay={i * 80}>
              <Link
                href={`/imoveis?tipo=${cat.kind}`}
                className={`group relative block aspect-[3/4] overflow-hidden rounded-2xl ${
                  hasPhoto ? "bg-surface-2" : FALLBACK_BLOCK[cat.kind]
                }`}
              >
                {hasPhoto && (
                  <>
                    <Image
                      src={publicUrl(cat.coverStorageKey!)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/45" />
                  </>
                )}
                <div className="absolute inset-0 flex flex-col justify-end gap-1 p-4 sm:p-5">
                  <span className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold uppercase tracking-wide sm:text-base ${
                        hasPhoto ? "text-white" : "text-ink"
                      }`}
                    >
                      {PROPERTY_KIND_LABELS[cat.kind]}
                    </span>
                    <ArrowUpRight
                      className={`h-4 w-4 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
                        hasPhoto ? "text-white" : "text-ink"
                      }`}
                    />
                  </span>
                  <span className={`text-xs ${hasPhoto ? "text-white/75" : "text-ink/60"}`}>
                    {cat.total} imóve{cat.total > 1 ? "is" : "l"}
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
