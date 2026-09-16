import { env } from "@/lib/env";
import type { Property, PropertyPhoto } from "@/db/schema";
import { publicUrl } from "@/lib/storage/url";

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
  property: Pick<
    Property,
    "title" | "description" | "slug" | "publishedAt" | "salePrice" | "status" | "city" | "state"
  >,
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
    // Sem postalCode de propósito: no Brasil um CEP costuma identificar uma
    // rua só (às vezes um único condomínio), o que praticamente equivale a
    // expor o endereço exato — o mesmo dado que o catálogo público nunca
    // mostra em nenhum outro lugar da página.
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city ?? undefined,
      addressRegion: property.state ?? undefined,
      addressCountry: "BR",
    },
  };
}

/**
 * Serializa para injetar em <script type="application/ld+json"> com
 * dangerouslySetInnerHTML. `JSON.stringify` sozinho não escapa `<` — um
 * título/descrição de imóvel contendo `</script>` fecharia a tag e
 * injetaria HTML/script arbitrário na página pública. `<` é
 * interpretado de volta como `<` pelo parser de JSON, sem mudar o dado.
 */
export function toSafeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
