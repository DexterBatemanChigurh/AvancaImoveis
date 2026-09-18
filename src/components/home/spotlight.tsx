import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import type { PropertyPhoto } from "@/db/schema";
import type { PublicProperty } from "@/features/properties/queries";
import { publicUrl } from "@/lib/storage/url";

type SpotlightProperty = PublicProperty & { photos: PropertyPhoto[] };

export function Spotlight({ property }: { property: SpotlightProperty | null }) {
  if (!property) return null;
  const cover = property.photos[0];

  return (
    <section className="relative flex min-h-[80vh] w-full items-end overflow-hidden bg-ink">
      {cover && (
        <Image
          src={publicUrl(cover.storageKey)}
          alt={property.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5" />

      <Reveal className="container relative z-10 flex flex-col gap-4 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
          Imóvel do mês
        </p>
        <h2 className="max-w-xl text-3xl text-white sm:text-5xl">{property.title}</h2>
        {property.description && (
          <p className="max-w-md text-base leading-relaxed text-white/85">
            {property.description.length > 160
              ? `${property.description.slice(0, 160).trim()}…`
              : property.description}
          </p>
        )}
        <Link
          href={`/imovel/${property.slug}`}
          className="mt-2 flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.02]"
        >
          Conhecer imóvel
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
