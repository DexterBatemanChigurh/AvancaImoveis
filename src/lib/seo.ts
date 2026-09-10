import { env } from "@/lib/env";
import type { Property, PropertyPhoto } from "@/db/schema";
import { publicUrl } from "@/lib/storage/r2";

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${path}`;
}

export function propertyPath(slug: string) {
  return `/imovel/${slug}`;
}

/**
 * JSON-LD schema.org para a página do imóvel.
 * Ajuda o Google a exibir o resultado com foto e preço (proposta §5).
 */
export function propertyJsonLd(
  property: Property,
  photos: Pick<PropertyPhoto, "storageKey">[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? undefined,
    url: absoluteUrl(propertyPath(property.slug)),
    datePosted: property.publishedAt?.toISOString(),
    image: photos.map((p) => publicUrl(p.storageKey)),
    offers: {
      "@type": "Offer",
      price: property.salePrice,
      priceCurrency: "BRL",
      availability:
        property.status === "disponivel"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city ?? undefined,
      addressRegion: property.state ?? undefined,
      postalCode: property.zipCode ?? undefined,
      addressCountry: "BR",
    },
  };
}
