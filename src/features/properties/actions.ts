"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

import { requireUser } from "@/features/auth/session";
import { notifyMatchingAlerts } from "@/features/alerts/notify";
import { emitCatalogChanged } from "@/lib/events";
import { geocodeAddressCascade } from "@/lib/geocode";
import { buildPropertySlug } from "@/lib/slug";
import { propertyFormSchema } from "./schema";

type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Campos "uma por linha" chegam como texto; viram array aqui. */
function lines(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return propertyFormSchema.safeParse({
    ...raw,
    features: lines(formData, "features"),
    condoFeatures: lines(formData, "condoFeatures"),
    highlights: lines(formData, "highlights"),
    neighborhood: lines(formData, "neighborhood"),
    hideExactAddress: formData.get("hideExactAddress") === "on",
    forceGeocode: formData.get("forceGeocode") === "on",
  });
}

export async function createProperty(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const coords = await resolveCoordinates(v, null);
  const slug = buildPropertySlug({ title: v.title, district: v.district });

  const [row] = await db
    .insert(properties)
    .values({
      ...toColumns(v),
      ...coords,
      slug,
      publishedAt: v.status === "disponivel" ? new Date() : null,
    })
    .returning({ id: properties.id });

  if (v.status === "disponivel") {
    // Aguarda pra garantir que roda antes do redirect encerrar a resposta —
    // nunca derruba o salvamento, só loga se o e-mail falhar.
    await notifyMatchingAlerts({
      id: row!.id,
      slug,
      title: v.title,
      salePrice: v.salePrice,
      district: v.district || null,
      kind: v.kind,
      bedrooms: v.bedrooms,
    }).catch((err) => console.error("notifyMatchingAlerts:", err));
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  revalidatePath(`/imovel/${slug}`);
  emitCatalogChanged();
  redirect("/admin/imoveis");
}

export async function updateProperty(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const current = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    columns: { publishedAt: true, latitude: true, longitude: true, slug: true },
  });
  const coords = await resolveCoordinates(v, current ?? null);
  const isNewlyPublished = v.status === "disponivel" && !current?.publishedAt;

  await db
    .update(properties)
    .set({
      ...toColumns(v),
      ...coords,
      updatedAt: new Date(),
      publishedAt: isNewlyPublished
        ? new Date()
        : (current?.publishedAt ?? null),
    })
    .where(eq(properties.id, id));

  if (isNewlyPublished && current?.slug) {
    await notifyMatchingAlerts({
      id,
      slug: current.slug,
      title: v.title,
      salePrice: v.salePrice,
      district: v.district || null,
      kind: v.kind,
      bedrooms: v.bedrooms,
    }).catch((err) => console.error("notifyMatchingAlerts:", err));
  }

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${id}`);
  revalidatePath("/imoveis");
  if (current?.slug) revalidatePath(`/imovel/${current.slug}`);
  emitCatalogChanged();
  redirect("/admin/imoveis");
}

/**
 * Resolve latitude/longitude do imóvel:
 * 1. Se "forceGeocode" está marcado, ignora tudo abaixo e geocodifica de novo.
 * 2. Senão, se o pino do mapa (latitude/longitude do formulário) tem valor,
 *    usa isso — é o que o admin ajustou manualmente clicando no mapa.
 * 3. Senão, mantém o que já estava salvo (evita o pino "pular" a cada edição).
 * 4. Senão, geocodifica o endereço.
 * Nunca derruba o salvamento — falha de geocodificação só deixa sem coordenada.
 */
async function resolveCoordinates(
  v: ReturnType<typeof propertyFormSchema.parse>,
  current: { latitude: number | null; longitude: number | null } | null,
): Promise<{ latitude: number | null; longitude: number | null }> {
  // (0, 0) não é uma coordenada real de nada no Brasil — trata como "sem
  // coordenada" pra nunca ficar preso nela (resíduo de um bug já corrigido).
  const isRealCoord = (
    lat: number | null | undefined,
    lng: number | null | undefined,
  ) => lat != null && lng != null && !(lat === 0 && lng === 0);

  if (!v.forceGeocode) {
    if (isRealCoord(v.latitude, v.longitude)) {
      return { latitude: v.latitude!, longitude: v.longitude! };
    }
    if (isRealCoord(current?.latitude, current?.longitude)) {
      return { latitude: current!.latitude, longitude: current!.longitude };
    }
  }

  if (!v.district && !v.city) return { latitude: null, longitude: null };

  const result = await geocodeAddressCascade({
    street: v.street,
    number: v.number,
    district: v.district,
    city: v.city,
    state: v.state,
  }).catch(() => null);

  return result
    ? { latitude: result.latitude, longitude: result.longitude }
    : { latitude: null, longitude: null };
}

/** Mapeia os valores validados para as colunas da tabela. */
function toColumns(v: ReturnType<typeof propertyFormSchema.parse>) {
  return {
    title: v.title,
    code: v.code,
    status: v.status,
    kind: v.kind,
    salePrice: v.salePrice,
    condoFee: v.condoFee ?? null,
    iptuYearly: v.iptuYearly ?? null,
    street: v.street || null,
    number: v.number || null,
    complement: v.complement || null,
    district: v.district || null,
    city: v.city || null,
    state: v.state || null,
    zipCode: v.zipCode || null,
    hideExactAddress: v.hideExactAddress,
    usableArea: v.usableArea ?? null,
    totalArea: v.totalArea ?? null,
    bedrooms: v.bedrooms,
    suites: v.suites,
    bathrooms: v.bathrooms,
    parkingSpots: v.parkingSpots,
    description: v.description || null,
    features: v.features,
    condoFeatures: v.condoFeatures,
    highlights: v.highlights,
    neighborhood: v.neighborhood,
    ownerId: v.ownerId || null,
    listingType: v.listingType || null,
    listingStart: v.listingStart || null,
    listingEnd: v.listingEnd || null,
    commissionPct: v.commissionPct ?? null,
  };
}
