import "server-only";

import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { properties, propertyPhotos } from "@/db/schema";

export type CatalogFilters = {
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
};

/** Imóveis visíveis no catálogo público — só `disponivel`. */
export async function listPublicProperties(filters: CatalogFilters = {}) {
  const where = and(
    eq(properties.status, "disponivel"),
    filters.district
      ? ilike(properties.district, `%${filters.district}%`)
      : undefined,
    filters.minPrice ? gte(properties.salePrice, filters.minPrice) : undefined,
    filters.maxPrice ? lte(properties.salePrice, filters.maxPrice) : undefined,
    filters.minBedrooms
      ? gte(properties.bedrooms, filters.minBedrooms)
      : undefined,
  );

  return db.query.properties.findMany({
    where,
    orderBy: [desc(properties.publishedAt), desc(properties.createdAt)],
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: 1,
      },
    },
  });
}

export async function getPublicPropertyBySlug(slug: string) {
  // Proprietário e documentos NÃO são carregados aqui — nunca vão para o público.
  return db.query.properties.findFirst({
    where: and(eq(properties.slug, slug), eq(properties.status, "disponivel")),
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

export async function incrementPropertyViews(id: string) {
  await db
    .update(properties)
    .set({ viewsCount: sql`${properties.viewsCount} + 1` })
    .where(eq(properties.id, id));
}

/* --------------------------- painel interno --------------------------- */

export async function listAdminProperties() {
  return db.query.properties.findMany({
    orderBy: [desc(properties.updatedAt)],
    with: {
      photos: {
        orderBy: [desc(propertyPhotos.isCover), asc(propertyPhotos.position)],
        limit: 1,
      },
      owner: true,
    },
  });
}

export async function getPropertyById(id: string) {
  return db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      photos: { orderBy: [asc(propertyPhotos.position)] },
      documents: true,
      owner: true,
    },
  });
}
