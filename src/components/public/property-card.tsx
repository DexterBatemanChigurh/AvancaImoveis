import Image from "next/image";
import Link from "next/link";

import type { Property, PropertyPhoto } from "@/db/schema";
import { formatArea, formatBRL } from "@/lib/format";
import { publicUrl } from "@/lib/storage/r2";

type Props = {
  property: Property & { photos: PropertyPhoto[] };
};

export function PropertyCard({ property }: Props) {
  const cover = property.photos[0];

  return (
    <Link
      href={`/imovel/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-surface-2">
        {cover ? (
          <Image
            src={publicUrl(cover.thumbKey ?? cover.storageKey)}
            alt={cover.alt ?? property.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            sem foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {[property.district, property.city].filter(Boolean).join(" · ") || "Localização a confirmar"}
        </p>
        <h3 className="font-display text-lg leading-snug">{property.title}</h3>
        <p className="text-lg font-semibold text-accent-ink">
          {formatBRL(property.salePrice)}
        </p>
        <p className="mt-auto pt-2 text-sm text-muted">
          {property.bedrooms > 0 && <>{property.bedrooms} quartos · </>}
          {property.bathrooms > 0 && <>{property.bathrooms} banheiros · </>}
          {property.parkingSpots > 0 && <>{property.parkingSpots} vagas · </>}
          {property.usableArea ? formatArea(property.usableArea) : null}
        </p>
      </div>
    </Link>
  );
}
