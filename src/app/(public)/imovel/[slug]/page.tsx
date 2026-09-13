import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Camera,
  Car,
  ChevronRight,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
} from "lucide-react";

import { BackButton } from "@/components/public/back-button";
import { ExpandableText } from "@/components/public/expandable-text";
import { FavoriteButton } from "@/components/public/favorite-button";
import { FeatureChecklist } from "@/components/public/feature-checklist";
import { InterestForm } from "@/components/public/interest-form";
import { PhoneReveal } from "@/components/public/phone-reveal";
import { PropertyCard } from "@/components/public/property-card";
import { PropertyGallery } from "@/components/public/property-gallery";
import { ShareButton } from "@/components/public/share-button";
import {
  getPublicPropertyBySlug,
  incrementPropertyViews,
  listAvailableDistricts,
  listSimilarProperties,
} from "@/features/properties/queries";
import { AVANCA, waLink } from "@/lib/brand";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { formatArea, formatBRL, formatRelativeDays } from "@/lib/format";
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
  const canonicalUrl = absoluteUrl(propertyPath(property.slug));
  const waHref = waLink(
    `Olá! Tenho interesse no imóvel ${property.code} — ${property.title} (${canonicalUrl})`,
  );
  const reportHref = waLink(
    `Olá! Quero reportar um problema no anúncio ${property.code} — ${property.title} (${canonicalUrl})`,
  );

  return (
    // Margem da página (independente do .container genérico do site, só
    // pra esta tela) — zerada de propósito e sem limite de largura, então
    // as fotos e o resto do conteúdo colam mesmo na borda esquerda em
    // qualquer monitor (um max-w com mx-auto sobraria como respiro dos dois
    // lados em telas largas). Pra reintroduzir isso, volte a colocar
    // "mx-auto max-w-[1800px]"; pra ajustar só a distância das fotos sem
    // mexer no resto da página, use padding horizontal só no bloco da
    // galeria em vez de mudar aqui.
    <article className="flex flex-col gap-12 px-0 pb-10 sm:gap-16 sm:pb-16">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toSafeJsonLd(propertyJsonLd(property, property.photos)),
        }}
      />

      {/* A foto é a primeira coisa que a pessoa vê — texto/preço vêm depois.
          Selos flutuantes (fotos/mapa/contato) sobre a imagem, como numa
          vitrine de imóveis de verdade — não só uma legenda embaixo. */}
      {property.photos.length > 0 && (
        <div className="relative">
          {/* top-24 (não top-4): o header fixo/transparente ocupa os
              primeiros 80px dessa página agora — os selos ficam logo
              abaixo dele, não por baixo da logo/menu. */}
          <div className="pointer-events-none absolute left-4 top-24 z-20 flex flex-wrap items-center gap-2">
            <BackButton />
            <span className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-bg/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
              <Camera className="h-3.5 w-3.5" />
              {property.photos.length} foto{property.photos.length > 1 ? "s" : ""}
            </span>
            {hasMap && (
              <a
                href="#localizacao"
                className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-bg/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur hover:bg-bg"
              >
                <MapPin className="h-3.5 w-3.5" />
                Mapa
              </a>
            )}
          </div>
          <div className="pointer-events-none absolute right-4 top-24 z-20 flex items-center gap-2">
            <ShareButton
              title={property.title}
              url={canonicalUrl}
              iconOnly
              className="pointer-events-auto"
            />
            <FavoriteButton propertyId={property.id} className="pointer-events-auto" />
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-bg shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Conversar agora
            </a>
          </div>
          <PropertyGallery title={property.title} photos={property.photos} />
        </div>
      )}

      {/* Só a foto fica colada na borda — todo o resto (texto, formulário,
          imóveis parecidos etc.) ganha de volta a margem lateral aqui. */}
      <div className="flex flex-col gap-12 px-6 sm:gap-16 sm:px-10">
        <Breadcrumb
          kind={property.kind}
          state={property.state}
          city={property.city}
          district={property.district}
          street={property.street}
        />

        {/* Título/fatos rápidos ao lado da localização, logo abaixo das
            fotos — a versão completa de cada seção (Facts, descrição etc.)
            continua na coluna abaixo; aqui é só o resumo + o mapa. */}
        <div className="flex flex-col gap-6 rounded-2xl bg-surface-2 p-6 lg:w-1/2 lg:origin-left lg:scale-125">
          <div className="flex flex-wrap items-center gap-2">
            {property.listingType === "exclusiva" && (
              <span className="rounded border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Destaque
              </span>
            )}
            <span className="rounded border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Para comprar
            </span>
            <span className="rounded border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {PROPERTY_KIND_LABELS[property.kind]}
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,420px)] lg:justify-start lg:divide-x lg:divide-line">
            <header className="flex flex-col gap-3 text-left lg:pr-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                {property.code}
                {property.district ? ` · ${property.district}` : ""}
              </p>
              <h1 className="max-w-2xl text-2xl sm:text-3xl">{property.title}</h1>
              <p className="text-2xl font-medium">{formatBRL(property.salePrice)}</p>

              <QuickFacts property={property} />

              {property.features.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex max-w-xs flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-bg px-4 py-2 text-sm font-semibold sm:max-w-sm">
                    {property.features.slice(0, 3).map((item, index) => (
                      <span key={item} className="flex items-center gap-2">
                        {index > 0 && (
                          <span className="h-1 w-1 shrink-0 rounded-full bg-line" />
                        )}
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                  {property.features.length > 3 && (
                    <a
                      href="#caracteristicas"
                      className="link-underline shrink-0 text-xs font-medium"
                    >
                      +{property.features.length - 3}
                    </a>
                  )}
                </div>
              )}

              {(property.publishedAt || property.updatedAt) && (
                <p className="text-xs text-muted">
                  {property.publishedAt &&
                    `Publicado há ${formatRelativeDays(property.publishedAt)}`}
                  {property.publishedAt && property.updatedAt && ", "}
                  {property.updatedAt &&
                    `atualizado há ${formatRelativeDays(property.updatedAt)}`}
                  .
                </p>
              )}
            </header>

            <section id="localizacao" className="flex flex-col gap-3 scroll-mt-24 lg:pl-6">
              <h2 className="text-lg">Localização</h2>
              {(property.street || property.district || property.city) && (
                <p className="flex items-start gap-1.5 text-sm text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {[
                    property.street,
                    property.number,
                    property.district,
                    property.city,
                    property.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {hasMap ? (
                <>
                  <iframe
                    title="Mapa do imóvel"
                    className="mb-4 h-40 w-full origin-top scale-110 rounded-brand border border-line"
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
                      className="flex h-10 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium hover:bg-surface"
                    >
                      <MapPin className="h-4 w-4" />
                      Abrir no Google Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 items-center gap-2 rounded-full border border-line bg-bg px-4 text-sm font-medium hover:bg-surface"
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
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="flex flex-col gap-10">
            {property.description && (
              <section className="flex flex-col gap-2">
                <h2 className="text-xl">Descrição</h2>
                <ExpandableText text={property.description} />
              </section>
            )}
  
            {property.features.length > 0 && (
              <section id="caracteristicas" className="flex flex-col gap-2 scroll-mt-24">
                <h2 className="text-xl">Características</h2>
                <FeatureChecklist items={property.features} />
              </section>
            )}
            <ListSection title="Diferenciais" items={property.highlights} />
            <ListSection title="Na região" items={property.neighborhood} />

            <section className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-6">
              <h2 className="text-lg">Segurança em primeiro lugar</h2>
              <ul className="flex flex-col gap-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Nunca transfira dinheiro sem visitar o imóvel e verificar a documentação.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Não compartilhe seus dados pessoais antes de confirmar o anúncio.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Encontrou uma informação errada?{" "}
                    <a
                      href={reportHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline font-medium text-ink"
                    >
                      Avise a gente
                    </a>
                    .
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* No mobile aparece logo após os fatos do imóvel, não só no fim da
              página inteira — no desktop volta pra coluna lateral normal. */}
          <aside className="order-first -mt-[479px] flex h-fit scale-[1.35] -translate-x-[135px] flex-col gap-4 rounded-2xl bg-surface-2 p-6 lg:sticky lg:top-24 lg:order-none">
            <h2 className="text-lg">Contatar anunciante</h2>
            <InterestForm propertyId={property.id} />

            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <h2 className="text-lg">Conversar com anunciante</h2>
              <PhoneReveal phone={AVANCA.phoneDisplay} />
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
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
      </div>
    </article>
  );
}

/** Monta a URL do catálogo já filtrada, só com os parâmetros preenchidos. */
function catalogHref(params: Record<string, string | null | undefined>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const query = qs.toString();
  return query ? `/imoveis?${query}` : "/imoveis";
}

function Breadcrumb({
  kind,
  state,
  city,
  district,
  street,
}: {
  kind: keyof typeof PROPERTY_KIND_LABELS;
  state: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
}) {
  const segments: { label: string; href?: string }[] = [
    { label: "Imóveis", href: "/imoveis" },
    { label: PROPERTY_KIND_LABELS[kind], href: catalogHref({ tipo: kind }) },
  ];
  if (state) {
    segments.push({ label: state, href: catalogHref({ tipo: kind, uf: state }) });
  }
  if (city) {
    segments.push({ label: city, href: catalogHref({ tipo: kind, uf: state, cidade: city }) });
  }
  if (district) {
    segments.push({
      label: district,
      href: catalogHref({ tipo: kind, uf: state, cidade: city, bairro: district }),
    });
  }
  if (street) {
    segments.push({ label: street });
  }

  return (
    <nav aria-label="Trilha" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
      {segments.map((segment, index) => (
        <span key={segment.label} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {segment.href ? (
            <Link href={segment.href} className="hover:text-ink hover:underline">
              {segment.label}
            </Link>
          ) : (
            <span>{segment.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Tira rápida logo abaixo do título — os mesmos 4 dados que já aparecem
 * no card do catálogo (mesmos ícones do PropertyCard), só que aqui em
 * formato de resumo. A lista completa (suítes, área total, condomínio,
 * IPTU) continua no Facts, mais abaixo. */
function QuickFacts({
  property,
}: {
  property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>;
}) {
  if (!property) return null;
  const items = [
    {
      icon: Ruler,
      label: "Metragem",
      value: property.usableArea ? formatArea(property.usableArea) : null,
    },
    {
      icon: BedDouble,
      label: "Quartos",
      value: property.bedrooms ? String(property.bedrooms) : null,
    },
    {
      icon: Bath,
      label: "Banheiros",
      value: property.bathrooms ? String(property.bathrooms) : null,
    },
    {
      icon: Car,
      label: "Vagas",
      value: property.parkingSpots ? String(property.parkingSpots) : null,
    },
  ].filter((item) => item.value);
  if (items.length === 0) return null;

  return (
    <div className="flex max-w-full shrink-0 self-start gap-5 overflow-x-auto rounded-2xl bg-bg px-4 py-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex shrink-0 flex-col gap-1 whitespace-nowrap">
          <span className="text-xs text-muted">{label}</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            {value}
          </span>
        </div>
      ))}
    </div>
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
