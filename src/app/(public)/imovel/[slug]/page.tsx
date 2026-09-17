import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Camera,
  Car,
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { BackButton } from "@/components/public/back-button";
import { CharacteristicsTabs } from "@/components/public/characteristics-tabs";
import { ExpandableText } from "@/components/public/expandable-text";
import { FavoriteButton } from "@/components/public/favorite-button";
import { InterestForm } from "@/components/public/interest-form";
import { PhoneReveal } from "@/components/public/phone-reveal";
import { PropertyCard } from "@/components/public/property-card";
import { PropertyGallery } from "@/components/public/property-gallery";
import { PropertyMap } from "@/components/public/property-map";
import { ShareButton } from "@/components/public/share-button";
import { WhatsappLink } from "@/components/public/whatsapp-link";
import {
  getPublicPropertyBySlug,
  incrementPropertyViews,
  listAvailableDistricts,
  listSimilarProperties,
} from "@/features/properties/queries";
import { AVANCA, waLink } from "@/lib/brand";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { formatArea, formatBRL, formatRelativeDays } from "@/lib/format";
import { jitterCoordinate } from "@/lib/geo-privacy";
import { getClientIp, hashIp } from "@/lib/request-ip";
import {
  absoluteUrl,
  propertyJsonLd,
  propertyPath,
  toSafeJsonLd,
} from "@/lib/seo";
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

  // Nunca usa a coordenada real do imóvel aqui — nem no mapa embutido, nem
  // nos links externos (Google Maps/Street View) abaixo. `displayCoord` já
  // vem deslocada (lib/geo-privacy.ts): endereço exato nunca é exposto no
  // catálogo público, pra nenhum imóvel.
  const displayCoord =
    property.latitude != null && property.longitude != null
      ? jitterCoordinate(property.latitude, property.longitude)
      : null;
  const hasMap = Boolean(displayCoord);
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
              {property.photos.length} foto
              {property.photos.length > 1 ? "s" : ""}
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
            <FavoriteButton
              propertyId={property.id}
              className="pointer-events-auto"
            />
            <WhatsappLink
              href={waHref}
              propertyId={property.id}
              aria-label="Conversar agora"
              className="pointer-events-auto flex h-8 w-8 items-center justify-center gap-1.5 rounded-full bg-ink text-xs font-semibold text-bg shadow-sm transition-opacity hover:opacity-90 sm:h-auto sm:w-auto sm:px-3.5 sm:py-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Conversar agora</span>
            </WhatsappLink>
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
        />

        {/* Duas colunas de verdade (sem hacks de zoom): conteúdo principal à
            esquerda em ordem natural de leitura, sidebar de contato fixa
            (sticky) à direita — a mesma escala tipográfica do resto do
            site, nada de compensar proporção com CSS zoom. */}
        <div className="grid gap-10 lg:grid-cols-[1fr_23rem] lg:items-start lg:gap-12">
          <div className="flex flex-col gap-10 lg:col-start-1 lg:row-start-1">
            {/* Título, preço e fatos rápidos — a informação mais importante
                (preço) com o maior peso visual do bloco. */}
            <div className="flex flex-col gap-5 rounded-2xl bg-surface-2 p-6 sm:p-8">
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

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                  {property.code}
                  {property.district ? ` · ${property.district}` : ""}
                </p>
                <h1 className="max-w-2xl text-2xl sm:text-3xl">{property.title}</h1>
                <p className="text-3xl font-semibold sm:text-4xl">
                  {formatBRL(property.salePrice)}
                </p>
              </div>

              <QuickFacts property={property} />

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
            </div>

            {/* Localização — seção própria de largura cheia, mapa com mais
                presença visual (era 112px de altura, hack pra caber ao lado
                do título). */}
            <section
              id="localizacao"
              className="flex flex-col gap-4 scroll-mt-24 rounded-2xl bg-surface-2 p-6 sm:p-8"
            >
              <h2 className="text-lg">Localização</h2>
              {(property.district || property.city) && (
                <p className="flex items-start gap-1.5 text-sm text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {[property.district, property.city, property.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {displayCoord ? (
                <div className="relative h-64 w-full overflow-hidden rounded-brand border border-line sm:h-80">
                  <PropertyMap lat={displayCoord.lat} lng={displayCoord.lng} />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${displayCoord.lat},${displayCoord.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-bg/95 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur hover:bg-bg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver área no mapa
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Localização deste imóvel ainda não disponível.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-6 sm:p-8">
              <ValuesTable property={property} />
            </section>

            {property.description && (
              <section className="flex flex-col gap-3">
                <h2 className="text-2xl">Descrição</h2>
                <div className="max-w-[65ch]">
                  <ExpandableText text={property.description} />
                </div>
              </section>
            )}

            {(property.features.length > 0 ||
              property.condoFeatures.length > 0) && (
              <section
                id="caracteristicas"
                className="flex flex-col gap-4 scroll-mt-24 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-2xl">Características</h2>
                <CharacteristicsTabs
                  features={property.features}
                  condoFeatures={property.condoFeatures}
                />
              </section>
            )}
            <ListSection
              title="Diferenciais"
              items={property.highlights}
              icon={Sparkles}
            />
            <ListSection
              title="Na região"
              items={property.neighborhood}
              icon={MapPin}
            />

            <section className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-6 sm:p-8">
              <h2 className="text-lg">Segurança em primeiro lugar</h2>
              <ul className="flex flex-col gap-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Nunca transfira dinheiro sem visitar o imóvel e verificar a
                  documentação.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  Não compartilhe seus dados pessoais antes de confirmar o
                  anúncio.
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Encontrou uma informação errada?{" "}
                    <WhatsappLink
                      href={reportHref}
                      propertyId={property.id}
                      className="link-underline font-medium text-ink"
                    >
                      Avise a gente
                    </WhatsappLink>
                    .
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* No mobile aparece logo após os fatos do imóvel (ordem natural
              do documento), não só no fim da página inteira — no desktop
              vira coluna lateral fixa (sticky) ao lado de todo o conteúdo. */}
          <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-7 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <h2 className="text-lg">Contatar anunciante</h2>
            <InterestForm propertyId={property.id} />

            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <h2 className="text-lg">Conversar com anunciante</h2>
              <PhoneReveal phone={AVANCA.phoneDisplay} />
              <WhatsappLink
                href={waHref}
                propertyId={property.id}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </WhatsappLink>
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
}: {
  kind: keyof typeof PROPERTY_KIND_LABELS;
  state: string | null;
  city: string | null;
  district: string | null;
}) {
  const segments: { label: string; href?: string }[] = [
    { label: "Imóveis", href: "/imoveis" },
    { label: PROPERTY_KIND_LABELS[kind], href: catalogHref({ tipo: kind }) },
  ];
  if (state) {
    segments.push({
      label: state,
      href: catalogHref({ tipo: kind, uf: state }),
    });
  }
  if (city) {
    segments.push({
      label: city,
      href: catalogHref({ tipo: kind, uf: state, cidade: city }),
    });
  }
  if (district) {
    segments.push({
      label: district,
      href: catalogHref({
        tipo: kind,
        uf: state,
        cidade: city,
        bairro: district,
      }),
    });
  }
  return (
    <nav
      aria-label="Trilha"
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
    >
      {segments.map((segment, index) => (
        <span key={segment.label} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
          {segment.href ? (
            <Link
              href={segment.href}
              className="hover:text-ink hover:underline"
            >
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

/** Tabela de valores (venda, condomínio, IPTU) — some linhas que o imóvel
 * não tiver preenchidas (condomínio/IPTU são opcionais no cadastro). */
function ValuesTable({
  property,
}: {
  property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>;
}) {
  if (!property) return null;
  const rows = [
    { label: "Venda", value: formatBRL(property.salePrice) },
    {
      label: "Condomínio",
      // R$ 0 não é um valor real de condomínio — trata como "não preenchido".
      value:
        property.condoFee != null && property.condoFee > 0
          ? `${formatBRL(property.condoFee)}/mês`
          : null,
    },
    {
      label: "IPTU",
      value:
        property.iptuYearly != null && property.iptuYearly > 0
          ? `${formatBRL(property.iptuYearly)}/ano`
          : null,
    },
  ].filter((row): row is { label: string; value: string } => row.value != null);
  if (rows.length === 0) return null;

  return (
    <>
      <h2 className="text-lg">Valores</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {rows.map((row) => (
              <th
                key={row.label}
                scope="col"
                className="pb-2 pr-8 text-left font-normal text-muted last:pr-0"
              >
                {row.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {rows.map((row) => (
              <td
                key={row.label}
                className="whitespace-nowrap pr-8 text-base font-semibold last:pr-0"
              >
                {row.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}

/** Tira rápida logo abaixo do título — os mesmos 4 dados que já aparecem
 * no card do catálogo (mesmos ícones do PropertyCard), só que aqui em
 * formato de resumo. */
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
      icon: Ruler,
      label: "Área total",
      value:
        property.totalArea && property.totalArea !== property.usableArea
          ? formatArea(property.totalArea)
          : null,
    },
    {
      icon: BedDouble,
      label: "Quartos",
      value: property.bedrooms != null ? String(property.bedrooms) : null,
    },
    {
      icon: BedDouble,
      label: "Suítes",
      value: property.suites > 0 ? String(property.suites) : null,
    },
    {
      icon: Bath,
      label: "Banheiros",
      value: property.bathrooms != null ? String(property.bathrooms) : null,
    },
    {
      icon: Car,
      label: "Vagas",
      value:
        property.parkingSpots != null ? String(property.parkingSpots) : null,
    },
  ].filter((item) => item.value != null);
  if (items.length === 0) return null;

  return (
    <div className="flex max-w-full shrink-0 self-start gap-5 overflow-x-auto rounded-2xl bg-bg px-4 py-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex shrink-0 flex-col gap-1 whitespace-nowrap"
        >
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

function ListSection({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon?: LucideIcon;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3 border-t border-line py-8">
      <h2 className="text-2xl">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-accent" />}
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
  const otherDistricts = districts
    .filter((d) => d !== currentDistrict)
    .slice(0, 6);
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
