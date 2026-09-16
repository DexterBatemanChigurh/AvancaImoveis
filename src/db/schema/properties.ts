import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  timestamps,
  listingType,
  propertyKind,
  propertyStatus,
} from "./_shared";
import { owners } from "./owners";

/**
 * Imóvel — entidade central (proposta §3).
 * Só entra no catálogo público quando `status = 'disponivel'`.
 */
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Identificação
  code: text("code").notNull().unique(), // código interno, ex.: "AV-0123"
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // usado na URL pública /imovel/[slug]
  status: propertyStatus("status").notNull().default("rascunho"),
  kind: propertyKind("kind").notNull().default("casa"),

  // Valores em BRL. `doublePrecision` = número em JS (mais simples no app).
  // Preços de venda não têm fração de centavo relevante; precisão é folgada.
  salePrice: doublePrecision("sale_price").notNull(),
  condoFee: doublePrecision("condo_fee"),
  iptuYearly: doublePrecision("iptu_yearly"),

  // Endereço
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  district: text("district"), // bairro — usado no filtro do catálogo
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),

  // Características
  usableArea: doublePrecision("usable_area"),
  totalArea: doublePrecision("total_area"),
  bedrooms: integer("bedrooms").notNull().default(0),
  suites: integer("suites").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  parkingSpots: integer("parking_spots").notNull().default(0),

  // Conteúdo editorial
  description: text("description"),
  features: text("features")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // Separado de `features` pra permitir a aba "Condomínio" na página pública.
  condoFeatures: text("condo_features")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  highlights: text("highlights")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  // Fase 1: pontos da vizinhança como texto livre. Pode virar tabela própria depois.
  neighborhood: text("neighborhood")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),

  // Métrica alimentada pelos acessos ao link público (proposta §6)
  viewsCount: integer("views_count").notNull().default(0),

  // Captação (interno). Proprietário(s) agora é N:N — ver property-owners.ts.
  listingType: listingType("listing_type"),
  listingStart: date("listing_start"),
  listingEnd: date("listing_end"),
  commissionPct: doublePrecision("commission_pct"),

  /** Momento em que passou a "disponivel" pela primeira vez — usado no SEO/sitemap. */
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

/**
 * Fotos do imóvel. Limite de 10 é validado na aplicação (proposta §2/§9).
 * `storageKey` é a chave no bucket R2; a URL pública é montada em lib/storage.
 */
export const propertyPhotos = pgTable("property_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  thumbKey: text("thumb_key"),
  alt: text("alt"),
  position: integer("position").notNull().default(0),
  isCover: boolean("is_cover").notNull().default(false),
  ...timestamps,
});

export type PropertyPhoto = typeof propertyPhotos.$inferSelect;
export type NewPropertyPhoto = typeof propertyPhotos.$inferInsert;

/**
 * Categorias de documento — CONFIGURÁVEIS (proposta §3).
 * Seed inicial em src/db/seed.ts: Matrícula, IPTU, Planta, Contrato de exclusividade, Habite-se.
 */
export const documentCategories = pgTable("document_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export type DocumentCategory = typeof documentCategories.$inferSelect;

/**
 * Arquivos privados anexados a um imóvel e/ou a um proprietário (nunca os
 * dois vazios ao mesmo tempo — validado na aplicação), agrupados por
 * categoria. Nunca aparecem no catálogo público — servidos por rota própria
 * que exige sessão (ver features/documents/).
 */
export const propertyDocuments = pgTable("property_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  ownerId: uuid("owner_id").references(() => owners.id, {
    onDelete: "cascade",
  }),
  categoryId: uuid("category_id").references(() => documentCategories.id, {
    onDelete: "set null",
  }),
  label: text("label").notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  ...timestamps,
});

export type PropertyDocument = typeof propertyDocuments.$inferSelect;
export type NewPropertyDocument = typeof propertyDocuments.$inferInsert;

/**
 * Uma linha por (imóvel, visitante) — garante no máximo 1 view contada por
 * IP em `properties.views_count`. Guarda o hash do IP, não o IP puro.
 */
export const propertyViews = pgTable(
  "property_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    unique: uniqueIndex("property_views_property_ip_unique").on(
      t.propertyId,
      t.ipHash,
    ),
  }),
);

export type PropertyView = typeof propertyViews.$inferSelect;
