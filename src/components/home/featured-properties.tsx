import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import type { Property, PropertyPhoto } from "@/db/schema";
import { formatBRL } from "@/lib/format";
import { publicUrl } from "@/lib/storage/url";

type FeaturedProperty = Property & { photos: PropertyPhoto[] };

/**
 * Layout muda conforme quantos imóveis existem — nunca deixa coluna/linha
 * vazia esperando um 3º item que não existe:
 * 1 imóvel  -> um card largo, sozinho.
 * 2 imóveis -> dois cards iguais lado a lado.
 * 3 imóveis -> um alto (2 linhas) + dois empilhados ao lado (layout original).
 */
export function FeaturedProperties({
  properties,
}: {
  properties: FeaturedProperty[];
}) {
  if (properties.length === 0) return null;

  return (
    <section id="destaques" className="container py-24 sm:py-32">
      <Reveal className="mb-12 flex flex-col gap-2 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl">Imóveis em destaque</h2>
        <p className="text-base text-muted">
          Uma seleção dos espaços que mais chamam atenção.
        </p>
      </Reveal>

      {properties.length === 1 && (
        <Reveal>
          <Tile property={properties[0]!} variant="wide" priority />
        </Reveal>
      )}

      {properties.length === 2 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {properties.map((p, i) => (
            <Reveal key={p.id} delay={i * 120}>
              <Tile property={p} variant="normal" priority={i === 0} />
            </Reveal>
          ))}
        </div>
      )}

      {properties.length >= 3 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-2">
          <Reveal className="lg:row-span-2">
            <Tile property={properties[0]!} variant="tall" priority />
          </Reveal>
          {properties.slice(1, 3).map((p, i) => (
            <Reveal key={p.id} delay={(i + 1) * 120}>
              <Tile property={p} variant="normal" />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function Tile({
  property,
  variant = "normal",
  priority = false,
}: {
  property: FeaturedProperty;
  variant?: "normal" | "tall" | "wide";
  priority?: boolean;
}) {
  const cover = property.photos[0];
  const location = [property.district, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/imovel/${property.slug}`}
      className={`group relative block h-full overflow-hidden rounded-2xl bg-surface-2 ${
        variant === "tall"
          ? "aspect-[4/5] lg:aspect-auto"
          : variant === "wide"
            ? "aspect-[16/9] lg:aspect-[21/9]"
            : "aspect-[16/11]"
      }`}
    >
      {cover ? (
        <Image
          src={publicUrl(cover.storageKey)}
          alt={property.title}
          fill
          priority={priority}
          sizes={
            variant === "wide" ? "100vw" : "(max-width: 1024px) 100vw, 50vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/75">
          {location || "Localização a confirmar"}
        </p>
        <h3 className="text-xl text-white sm:text-2xl">{property.title}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-medium text-white sm:text-xl">
            {formatBRL(property.salePrice)}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Ver imóvel
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
