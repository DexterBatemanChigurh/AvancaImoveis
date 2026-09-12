import Link from "next/link";
import { Bath, BedDouble, Car, MessageCircle, Ruler } from "lucide-react";

import { FavoriteButton } from "@/components/public/favorite-button";
import { PropertyCardMedia } from "@/components/public/property-card-media";
import type { Property, PropertyPhoto } from "@/db/schema";
import { waLink } from "@/lib/brand";
import { formatArea, formatBRL } from "@/lib/format";

const NEW_WITHIN_DAYS = 14;

type Props = {
  property: Property & { photos: PropertyPhoto[] };
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg">
      <Link href={`/imovel/${property.slug}`} className="flex flex-col">
        <PropertyCardMedia title={property.title} photos={property.photos} badges={badges} />

        <div className="flex flex-col gap-1.5 p-5 pb-3">
          <h3 className="truncate text-lg leading-snug">{property.title}</h3>
          {property.district || property.city ? (
            <p className="truncate text-base">
              <span className="font-semibold">{property.district}</span>
              {property.district && property.city ? ", " : ""}
              {property.city}
            </p>
          ) : (
            <p className="text-base text-muted">Localização a confirmar</p>
          )}
          {property.street && (
            <p className="truncate text-sm text-muted">{property.street}</p>
          )}

          <p className="pt-1 text-2xl font-semibold">{formatBRL(property.salePrice)}</p>
          {costs.length > 0 && (
            <p className="text-sm text-muted">{costs.join(" · ")}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-sm text-muted">
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

      <div className="flex items-center gap-2.5 p-5 pt-2">
        <FavoriteButton propertyId={property.id} className="h-10 w-10 shrink-0" />
        <a
          href={waLink(`Olá! Tenho interesse no imóvel ${property.code} — ${property.title}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-bg transition-opacity hover:opacity-85"
        >
          <MessageCircle className="h-4 w-4" />
          Contatar
        </a>
      </div>
    </div>
  );
}
