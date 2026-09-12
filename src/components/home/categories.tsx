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

export function Categories({ categories }: { categories: CategoryOverview[] }) {
  const available = categories.filter((c) => c.total > 0);
  if (available.length === 0) return null;

  return (
    <section className="container py-24 sm:py-32">
      <Reveal className="mb-12 flex flex-col gap-2 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl">Categorias</h2>
        <p className="text-base text-muted">Encontre pelo tipo de imóvel que você procura.</p>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {available.map((cat, i) => (
          <Reveal key={cat.kind} delay={i * 80}>
            <Link
              href={`/imoveis?tipo=${cat.kind}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2"
            >
              {cat.coverStorageKey && (
                <Image
                  src={publicUrl(cat.coverStorageKey)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              )}
              <div className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/45" />
              <div className="absolute inset-0 flex flex-col justify-end gap-1 p-4 sm:p-5">
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-white sm:text-base">
                    {PROPERTY_KIND_LABELS[cat.kind]}
                  </span>
                  <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                </span>
                <span className="text-xs text-white/75">
                  {cat.total} imóve{cat.total > 1 ? "is" : "l"}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
