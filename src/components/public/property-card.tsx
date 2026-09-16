import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Car, MessageCircle, Ruler } from "lucide-react";

import { FavoriteButton } from "@/components/public/favorite-button";
import { PropertyCardMedia } from "@/components/public/property-card-media";
import type { PropertyPhoto } from "@/db/schema";
import type { PublicProperty } from "@/features/properties/queries";
import { waLink } from "@/lib/brand";
import { formatArea, formatBRL } from "@/lib/format";

const NEW_WITHIN_DAYS = 14;

type Props = {
  property: PublicProperty & { photos: PropertyPhoto[] };
};

export function PropertyCard({ property }: Props) {
  const badges: string[] = [];
  if (property.listingType === "exclusiva") badges.push("Exclusivo");
  if (
    property.publishedAt &&
    Date.now() - new Date(property.publishedAt).getTime() <
      NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000
  ) {
    badges.push("Novo");
  }

  const costs = [
    property.condoFee ? `Cond. ${formatBRL(property.condoFee)}` : null,
    property.iptuYearly ? `IPTU ${formatBRL(property.iptuYearly)}` : null,
  ].filter(Boolean);

  return (
    <div className="group flex flex-col">
      <Link href={`/imovel/${property.slug}`} className="flex flex-col">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            <PropertyCardMedia
              title={property.title}
              photos={property.photos}
              badges={badges}
            />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Ver imóvel
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="flex flex-col gap-1 pt-4">
          {property.district || property.city ? (
            <p className="truncate text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {[property.district, property.city].filter(Boolean).join(", ")}
            </p>
          ) : (
            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              Localização a confirmar
            </p>
          )}
          <h3 className="truncate text-lg leading-snug">{property.title}</h3>
          <p className="text-xl font-medium">{formatBRL(property.salePrice)}</p>
          {costs.length > 0 && <p className="text-xs text-muted">{costs.join(" · ")}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted">
            {property.usableArea != null && (
              <span className="flex items-center gap-1.5">
                <Ruler className="h-4 w-4" /> {formatArea(property.usableArea)}
              </span>
            )}
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" /> {property.bathrooms}
              </span>
            )}
            {property.parkingSpots > 0 && (
              <span className="flex items-center gap-1.5">
                <Car className="h-4 w-4" /> {property.parkingSpots}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2.5 pt-3">
        <FavoriteButton propertyId={property.id} className="h-10 w-10 shrink-0" />
        <a
          href={waLink(`Olá! Tenho interesse no imóvel ${property.code} — ${property.title}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold transition-colors hover:bg-surface-2"
        >
          <MessageCircle className="h-4 w-4" />
          Contatar
        </a>
      </div>
    </div>
  );
}
