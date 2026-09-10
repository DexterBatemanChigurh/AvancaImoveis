import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { InterestForm } from "@/components/public/interest-form";
import {
  getPublicPropertyBySlug,
  incrementPropertyViews,
} from "@/features/properties/queries";
import { PROPERTY_KIND_LABELS } from "@/lib/constants";
import { formatArea, formatBRL } from "@/lib/format";
import { absoluteUrl, propertyJsonLd, propertyPath } from "@/lib/seo";
import { publicUrl } from "@/lib/storage/r2";

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

  // Contador de visualizações (proposta §6). Não bloqueia a renderização.
  void incrementPropertyViews(property.id).catch(() => {});

  const waMessage = encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${property.code} — ${property.title} (${absoluteUrl(
      propertyPath(property.slug),
    )})`,
  );

  return (
    <article className="flex flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(propertyJsonLd(property, property.photos)),
        }}
      />

      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {PROPERTY_KIND_LABELS[property.kind]} · {property.code}
          {property.district ? ` · ${property.district}` : ""}
        </p>
        <h1 className="text-3xl">{property.title}</h1>
        <p className="text-2xl font-semibold text-accent-ink">
          {formatBRL(property.salePrice)}
        </p>
      </header>

      {property.photos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {property.photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-card bg-surface-2 ${
                i === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={publicUrl(photo.storageKey)}
                alt={photo.alt ?? `${property.title} — foto ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <Facts property={property} />

          {property.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl">Descrição</h2>
              <p className="whitespace-pre-line text-muted">{property.description}</p>
            </section>
          )}

          <ListSection title="Características" items={property.features} />
          <ListSection title="Diferenciais" items={property.highlights} />
          <ListSection title="Na região" items={property.neighborhood} />

          {property.latitude && property.longitude && !property.hideExactAddress && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xl">Localização</h2>
              <iframe
                title="Mapa do imóvel"
                className="h-72 w-full rounded-card border border-line"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  property.longitude - 0.01
                }%2C${property.latitude - 0.01}%2C${property.longitude + 0.01}%2C${
                  property.latitude + 0.01
                }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`}
              />
            </section>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-card border border-line bg-surface p-5 lg:sticky lg:top-6">
          <a
            href={`https://wa.me/5500000000000?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center rounded-md bg-accent px-4 font-medium text-white hover:bg-accent-ink"
          >
            Falar no WhatsApp
          </a>
          <div className="border-t border-line pt-4">
            <h2 className="mb-3 text-lg">Tenho interesse</h2>
            <InterestForm propertyId={property.id} />
          </div>
        </aside>
      </div>
    </article>
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
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-4">
      {visible.map(([label, value]) => (
        <div key={label} className="flex flex-col">
          <dt className="font-mono text-xs uppercase tracking-wide text-muted">
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
            className="rounded border border-line bg-surface-2 px-2.5 py-1 text-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
