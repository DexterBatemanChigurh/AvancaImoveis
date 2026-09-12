import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, ChevronRight, MapPin, MessageCircle } from "lucide-react";

import { ExpandableText } from "@/components/public/expandable-text";
import { FeatureChecklist } from "@/components/public/feature-checklist";
import { InterestForm } from "@/components/public/interest-form";
import { PropertyCard } from "@/components/public/property-card";
import { PropertyGallery } from "@/components/public/property-gallery";
import {
  getPublicPropertyBySlug,
  incrementPropertyViews,
  listAvailableDistricts,
  listSimilarProperties,
} from "@/features/properties/queries";
import { AVANCA, waLink } from "@/lib/brand";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { formatArea, formatBRL } from "@/lib/format";
import { getClientIp, hashIp } from "@/lib/request-ip";
import { absoluteUrl, propertyJsonLd, propertyPath, toSafeJsonLd } from "@/lib/seo";
import { publicUrl } from "@/lib/storage/url";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug).catch(() => null);
  if (!property) return { title: "Imóvel não encontrado" };

  const cover = property.photos[0];
  const title = `${property.title} — ${formatBRL(property.salePrice)}`;
  const description =
    property.description?.slice(0, 155) ??
    `${PROPERTY_KIND_LABELS[property.kind]} à venda${
      property.district ? ` em ${property.district}` : ""
    }.`;

  return {
    title,
    description,
    alternates: { canonical: propertyPath(property.slug) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(propertyPath(property.slug)),
      images: cover ? [{ url: publicUrl(cover.storageKey) }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug).catch(() => null);
  if (!property) notFound();

  // Contador de visualizações (proposta §6) — no máximo 1 por IP.
  // Não bloqueia a renderização.
  getClientIp()
    .then((ip) => incrementPropertyViews(property.id, hashIp(ip)))
    .catch(() => {});

  const [similar, districts] = await Promise.all([
    listSimilarProperties(property, 3).catch(() => []),
    listAvailableDistricts().catch(() => []),
  ]);

  const hasMap = Boolean(property.latitude && property.longitude && !property.hideExactAddress);
  const waHref = waLink(
    `Olá! Tenho interesse no imóvel ${property.code} — ${property.title} (${absoluteUrl(
      propertyPath(property.slug),
    )})`,
  );

  return (
    <article className="container flex flex-col gap-10 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonLd(propertyJsonLd(property, property.photos)),
        }}
      />

      <Breadcrumb kind={property.kind} district={property.district} />

      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {PROPERTY_KIND_LABELS[property.kind]} · {property.code}
          {property.district ? ` · ${property.district}` : ""}
        </p>
        <h1 className="text-3xl sm:text-4xl">{property.title}</h1>
        <p className="text-2xl font-semibold">{formatBRL(property.salePrice)}</p>
      </header>

      {property.photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <PropertyGallery title={property.title} photos={property.photos} />
          {hasMap && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Camera className="h-4 w-4" />
              <a href="#localizacao" className="font-medium text-ink hover:underline">
                Ver no mapa
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <Facts property={property} />

          {property.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl">Descrição</h2>
              <ExpandableText text={property.description} />
            </section>
          )}

          {property.features.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl">Características</h2>
              <FeatureChecklist items={property.features} />
            </section>
          )}
          <ListSection title="Diferenciais" items={property.highlights} />
          <ListSection title="Na região" items={property.neighborhood} />

          <section id="localizacao" className="flex flex-col gap-3 scroll-mt-24">
            <h2 className="text-xl">Localização</h2>
            {hasMap ? (
              <>
                <iframe
                  title="Mapa do imóvel"
                  className="h-72 w-full rounded-brand border border-line"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    property.longitude! - 0.01
                  }%2C${property.latitude! - 0.01}%2C${property.longitude! + 0.01}%2C${
                    property.latitude! + 0.01
                  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`}
                />
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium hover:bg-surface-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Abrir no Google Maps
                  </a>
                  <a
                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium hover:bg-surface-2"
                  >
                    <Camera className="h-4 w-4" />
                    Ver no Street View
                  </a>
                </div>
              </>
            ) : (
              !property.hideExactAddress && (
                <p className="text-sm text-muted">
                  Localização deste imóvel ainda não disponível.
                </p>
              )
            )}
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-brand border border-line bg-surface p-5">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-4 font-semibold text-bg transition-opacity hover:opacity-85"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
          <p className="text-center text-xs text-muted">
            ou ligue em {AVANCA.phoneDisplay}
          </p>
          <div className="border-t border-line pt-4">
            <h2 className="mb-3 text-lg">Tenho interesse</h2>
            <InterestForm propertyId={property.id} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="text-xl">Imóveis parecidos</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      <SeeAlso currentDistrict={property.district} districts={districts} />
    </article>
  );
}

function Breadcrumb({
  kind,
  district,
}: {
  kind: keyof typeof PROPERTY_KIND_LABELS;
  district: string | null;
}) {
  return (
    <nav aria-label="Trilha" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
      <Link href="/imoveis" className="hover:text-ink hover:underline">
        Imóveis
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <Link href={`/imoveis?tipo=${kind}`} className="hover:text-ink hover:underline">
        {PROPERTY_KIND_LABELS[kind]}
      </Link>
      {district && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{district}</span>
        </>
      )}
    </nav>
  );
}

function Facts({
  property,
}: {
  property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>;
}) {
  if (!property) return null;
  const rows: [string, string | null][] = [
    ["Quartos", property.bedrooms ? String(property.bedrooms) : null],
    ["Suítes", property.suites ? String(property.suites) : null],
    ["Banheiros", property.bathrooms ? String(property.bathrooms) : null],
    ["Vagas", property.parkingSpots ? String(property.parkingSpots) : null],
    ["Área útil", property.usableArea ? formatArea(property.usableArea) : null],
    ["Área total", property.totalArea ? formatArea(property.totalArea) : null],
    ["Condomínio", property.condoFee ? formatBRL(property.condoFee, true) : null],
    ["IPTU/ano", property.iptuYearly ? formatBRL(property.iptuYearly, true) : null],
  ];
  const visible = rows.filter(([, v]) => v);
  if (visible.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-brand border border-line bg-surface p-5 sm:grid-cols-4">
      {visible.map(([label, value]) => (
        <div key={label} className="flex flex-col">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </dt>
          <dd className="text-lg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Links internos pra outros bairros/tipos — navegação + um empurrão de SEO. */
function SeeAlso({
  currentDistrict,
  districts,
}: {
  currentDistrict: string | null;
  districts: string[];
}) {
  const otherDistricts = districts.filter((d) => d !== currentDistrict).slice(0, 6);
  if (otherDistricts.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-line pt-8">
      <h2 className="text-lg">Veja também</h2>
      <div className="flex flex-wrap gap-2">
        {otherDistricts.map((d) => (
          <Link
            key={d}
            href={`/imoveis?bairro=${encodeURIComponent(d)}`}
            className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-ink hover:text-ink"
          >
            Imóveis em {d}
          </Link>
        ))}
        <Link
          href="/imoveis"
          className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-ink hover:text-ink"
        >
          Ver todo o catálogo
        </Link>
      </div>
    </section>
  );
}
