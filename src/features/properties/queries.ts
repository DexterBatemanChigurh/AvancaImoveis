import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  ne,
  notInArray,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  properties,
  propertyPhotos,
  propertyViews,
  type Property,
} from "@/db/schema";
import { MAX_PHOTOS_PER_PROPERTY } from "@/lib/constants";
import { startOfMonthBrasilia } from "@/lib/format";

export type CatalogSort = "recentes" | "menor-preco" | "maior-preco";

export const CATALOG_PAGE_SIZE = 24;
export const ADMIN_PAGE_SIZE = 50;

export type CatalogFilters = {
  district?: string;
  city?: string;
  state?: string;
  kind?: Property["kind"];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minParkingSpots?: number;
  sort?: CatalogSort;
  /** 1-indexado. */
  page?: number;
  pageSize?: number;
};

/**
 * Nunca inclui endereço exato nem coordenada exata em NADA que alcance o
 * público — nem na grade do catálogo, nem na API de favoritos, mesmo que a
 * UI atual não renderize esses campos. Uma resposta JSON pública com
 * `latitude`/`longitude`/`street` embutidos é inspecionável por qualquer
 * visitante (aba de rede do navegador), então a proteção tem que ser na
 * consulta, não só em "a tela não mostra isso".
 */
const EXCLUDE_EXACT_ADDRESS = {
  street: false,
  number: false,
  complement: false,
  zipCode: false,
  latitude: false,
  longitude: false,
} as const;

/** Página do imóvel: mantém lat/lng brutos (usados só no servidor pra
 * calcular o círculo aproximado — ver lib/geo-privacy.ts), mas nunca rua/
 * número/complemento/CEP. */
const EXCLUDE_STREET_ADDRESS = {
  street: false,
  number: false,
  complement: false,
  zipCode: false,
} as const;

/** Formato de imóvel que qualquer componente/rota pública pode receber. */
export type PublicProperty = Omit<
  Property,
  "street" | "number" | "complement" | "zipCode" | "latitude" | "longitude"
>;

/** Só a página do imóvel usa isto — mantém lat/lng brutos pro cálculo do
 * círculo aproximado no servidor (ver lib/geo-privacy.ts). */
export type PublicPropertyDetail = Omit<
  Property,
  "street" | "number" | "complement" | "zipCode"
>;

const SORTS: Record<CatalogSort, ReturnType<typeof desc>[]> = {
  recentes: [desc(properties.publishedAt), desc(properties.createdAt)],
  "menor-preco": [asc(properties.salePrice)],
  "maior-preco": [desc(properties.salePrice)],
};

/**
 * Imóveis visíveis no catálogo público — só `disponivel`, paginado.
 * Sem paginação, a lista cresceria sem limite conforme o catálogo aumenta.
 */
export async function listPublicProperties(filters: CatalogFilters = {}) {
  const where = and(
    eq(properties.status, "disponivel"),
    filters.district
      ? ilike(properties.district, `%${filters.district}%`)
      : undefined,
    filters.city ? ilike(properties.city, filters.city) : undefined,
    filters.state ? ilike(properties.state, filters.state) : undefined,
    filters.kind ? eq(properties.kind, filters.kind) : undefined,
    filters.minPrice ? gte(properties.salePrice, filters.minPrice) : undefined,
    filters.maxPrice ? lte(properties.salePrice, filters.maxPrice) : undefined,
    filters.minBedrooms
      ? gte(properties.bedrooms, filters.minBedrooms)
      : undefined,
    filters.minBathrooms
      ? gte(properties.bathrooms, filters.minBathrooms)
      : undefined,
    filters.minParkingSpots
      ? gte(properties.parkingSpots, filters.minParkingSpots)
      : undefined,
  );

  const pageSize = filters.pageSize ?? CATALOG_PAGE_SIZE;
  const page = Math.max(1, filters.page ?? 1);

  const [items, [{ n: total } = { n: 0 }]] = await Promise.all([
    db.query.properties.findMany({
      where,
      orderBy: SORTS[filters.sort ?? "recentes"],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      columns: EXCLUDE_EXACT_ADDRESS,
      with: {
        // Algumas fotos (não só a capa) para o carrossel no hover do card.
        photos: {
          orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
          limit: MAX_PHOTOS_PER_PROPERTY,
        },
      },
    }),
    db.select({ n: count() }).from(properties).where(where),
  ]);

  return { items, total, page, pageSize };
}

/** Bairros com pelo menos um imóvel disponível — alimenta o filtro de localização. */
export async function listAvailableDistricts(scope?: {
  city?: string;
  state?: string;
}): Promise<string[]> {
  const rows = await db
    .selectDistinct({ district: properties.district })
    .from(properties)
    .where(
      and(
        eq(properties.status, "disponivel"),
        isNotNull(properties.district),
        scope?.city ? ilike(properties.city, scope.city) : undefined,
        scope?.state ? ilike(properties.state, scope.state) : undefined,
      ),
    )
    .orderBy(asc(properties.district));
  return rows.map((r) => r.district).filter((d): d is string => Boolean(d));
}

/**
 * Imóveis "em destaque" pra home — os N com mais visualizações
 * (properties.views_count), dentro dos disponíveis pro público.
 */
export async function listFeaturedProperties(limit = 3) {
  return db.query.properties.findMany({
    where: eq(properties.status, "disponivel"),
    // Empate em views_count (comum com poucas visitas) sem 2º critério faz
    // o Postgres devolver uma ordem instável — a seção troca de imóvel a
    // cada carregamento. publishedAt desfaz o empate de forma consistente.
    orderBy: [desc(properties.viewsCount), desc(properties.publishedAt)],
    limit,
    columns: EXCLUDE_EXACT_ADDRESS,
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: MAX_PHOTOS_PER_PROPERTY,
      },
    },
  });
}

/**
 * "Imóvel do mês" — o mais visto dentro do mês corrente, calculado a
 * partir de `property_views` (tem `createdAt` por visita, ao contrário de
 * `properties.views_count`, que é um total acumulado desde sempre).
 */
export async function listMostViewedThisMonth(limit = 1) {
  const startOfMonth = startOfMonthBrasilia();

  const ranked = await db
    .select({ propertyId: propertyViews.propertyId, views: count() })
    .from(propertyViews)
    .innerJoin(properties, eq(properties.id, propertyViews.propertyId))
    .where(
      and(
        eq(properties.status, "disponivel"),
        gte(propertyViews.createdAt, startOfMonth),
      ),
    )
    .groupBy(propertyViews.propertyId)
    .orderBy(desc(count()))
    .limit(limit);

  if (ranked.length === 0) return [];

  const ids = ranked.map((r) => r.propertyId);
  const withData = await db.query.properties.findMany({
    where: inArray(properties.id, ids),
    columns: EXCLUDE_EXACT_ADDRESS,
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: MAX_PHOTOS_PER_PROPERTY,
      },
    },
  });

  const rank = new Map(ids.map((id, i) => [id, i]));
  return withData.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}

/**
 * Uma prévia por tipo de imóvel (para a seção de categorias da home):
 * quantos disponíveis existem e a foto de capa do imóvel mais visto
 * daquele tipo.
 */
export async function listCategoryOverview(): Promise<
  Array<{
    kind: Property["kind"];
    total: number;
    coverStorageKey: string | null;
  }>
> {
  const totals = await db
    .select({ kind: properties.kind, total: count() })
    .from(properties)
    .where(eq(properties.status, "disponivel"))
    .groupBy(properties.kind);

  const mostViewedWithPhotos = await db.query.properties.findMany({
    where: eq(properties.status, "disponivel"),
    orderBy: [desc(properties.viewsCount)],
    limit: 40,
    columns: { kind: true },
    with: {
      photos: { orderBy: [desc(propertyPhotos.isCover)], limit: 1 },
    },
  });

  return totals.map(({ kind, total }) => ({
    kind,
    total,
    coverStorageKey:
      mostViewedWithPhotos.find((p) => p.kind === kind && p.photos[0])
        ?.photos[0]?.storageKey ?? null,
  }));
}

/** Imóveis disponíveis a partir de uma lista de ids — usado pela página de favoritos. */
export async function listPublicPropertiesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.query.properties.findMany({
    where: and(
      eq(properties.status, "disponivel"),
      inArray(properties.id, ids),
    ),
    columns: EXCLUDE_EXACT_ADDRESS,
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: MAX_PHOTOS_PER_PROPERTY,
      },
    },
  });
}

/**
 * Imóveis parecidos pra mostrar no rodapé da página do imóvel — mesmo bairro
 * primeiro, completando com o mesmo tipo se faltar.
 */
export async function listSimilarProperties(
  current: { id: string; district: string | null; kind: Property["kind"] },
  limit = 4,
) {
  const base = and(
    eq(properties.status, "disponivel"),
    ne(properties.id, current.id),
  );

  const byDistrict = current.district
    ? await db.query.properties.findMany({
        where: and(base, eq(properties.district, current.district)),
        orderBy: [desc(properties.publishedAt)],
        limit,
        columns: EXCLUDE_EXACT_ADDRESS,
        with: {
          photos: {
            orderBy: [
              desc(propertyPhotos.isCover),
              asc(propertyPhotos.position),
            ],
            limit: 1,
          },
        },
      })
    : [];
  if (byDistrict.length >= limit) return byDistrict;

  const excludeIds = [current.id, ...byDistrict.map((p) => p.id)];
  const byKind = await db.query.properties.findMany({
    where: and(
      base,
      eq(properties.kind, current.kind),
      notInArray(properties.id, excludeIds),
    ),
    orderBy: [desc(properties.publishedAt)],
    limit: limit - byDistrict.length,
    columns: EXCLUDE_EXACT_ADDRESS,
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: 1,
      },
    },
  });

  return [...byDistrict, ...byKind];
}

export async function getPublicPropertyBySlug(slug: string) {
  // Proprietário e documentos NÃO são carregados aqui — nunca vão para o público.
  return db.query.properties.findFirst({
    where: and(eq(properties.slug, slug), eq(properties.status, "disponivel")),
    columns: EXCLUDE_STREET_ADDRESS,
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
      },
    },
  });
}

/** Slugs para o sitemap. */
export async function listPublicPropertySlugs() {
  return db
    .select({ slug: properties.slug, updatedAt: properties.updatedAt })
    .from(properties)
    .where(eq(properties.status, "disponivel"));
}

/**
 * Conta no máximo 1 view por IP por imóvel — evita view fantasma de quem
 * fica dando refresh na página ou de bot. `property_views` guarda quem já
 * foi contado (por hash do IP); só incrementa o contador na primeira vez.
 * Recebe o hash pronto (em vez de ler a request aqui) pra ficar fácil de
 * testar e pra não depender de next/headers dentro da camada de dados.
 */
export async function incrementPropertyViews(
  id: string,
  ipHash: string,
): Promise<void> {
  const [inserted] = await db
    .insert(propertyViews)
    .values({ propertyId: id, ipHash })
    .onConflictDoNothing({
      target: [propertyViews.propertyId, propertyViews.ipHash],
    })
    .returning({ id: propertyViews.id });

  if (!inserted) return; // já tinha view desse IP nesse imóvel

  await db
    .update(properties)
    .set({ viewsCount: sql`${properties.viewsCount} + 1` })
    .where(eq(properties.id, id));
}

/* --------------------------- painel interno --------------------------- */

export async function listAdminProperties(
  options: { page?: number; pageSize?: number } = {},
) {
  const pageSize = options.pageSize ?? ADMIN_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);

  const [items, [{ n: total } = { n: 0 }]] = await Promise.all([
    db.query.properties.findMany({
      orderBy: [desc(properties.updatedAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: {
        photos: {
          orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
          limit: 1,
        },
        owners: { with: { owner: true } },
      },
    }),
    db.select({ n: count() }).from(properties),
  ]);

  return { items, total, page, pageSize };
}

/** Lista enxuta pra <select> (visitas, negócios manuais, fechamento de venda). */
export async function listPropertiesForSelect() {
  return db.query.properties.findMany({
    columns: { id: true, title: true, code: true },
    orderBy: [asc(properties.title)],
  });
}

/** Imóveis disponíveis com só as colunas que o match (lib/match.ts) usa. */
export async function listPropertiesForMatch() {
  return db.query.properties.findMany({
    where: eq(properties.status, "disponivel"),
    columns: {
      id: true,
      slug: true,
      title: true,
      code: true,
      kind: true,
      city: true,
      district: true,
      salePrice: true,
      bedrooms: true,
      bathrooms: true,
      parkingSpots: true,
      usableArea: true,
      totalArea: true,
      features: true,
      condoFeatures: true,
      highlights: true,
      neighborhood: true,
    },
  });
}

export async function getPropertyById(id: string) {
  return db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      photos: { orderBy: [asc(propertyPhotos.position)] },
      documents: true,
      owners: { with: { owner: true } },
    },
  });
}
