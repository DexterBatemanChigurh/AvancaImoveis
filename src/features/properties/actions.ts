"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

import { requireUser } from "@/features/auth/session";
import { buildPropertySlug } from "@/lib/slug";
import { propertyFormSchema } from "./schema";

type ActionState = { ok: boolean; error?: string; fieldErrors?: Record<string, string[]> };

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
    highlights: lines(formData, "highlights"),
    neighborhood: lines(formData, "neighborhood"),
    hideExactAddress: formData.get("hideExactAddress") === "on",
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

  const [row] = await db
    .insert(properties)
    .values({
      ...toColumns(v),
      slug: buildPropertySlug({ title: v.title, district: v.district }),
      publishedAt: v.status === "disponivel" ? new Date() : null,
    })
    .returning({ id: properties.id });

  revalidatePath("/admin/imoveis");
  redirect(`/admin/imoveis/${row!.id}`);
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
    columns: { publishedAt: true },
  });

  await db
    .update(properties)
    .set({
      ...toColumns(v),
      updatedAt: new Date(),
      publishedAt:
        v.status === "disponivel" && !current?.publishedAt
          ? new Date()
          : current?.publishedAt ?? null,
    })
    .where(eq(properties.id, id));

  revalidatePath("/admin/imoveis");
  revalidatePath(`/admin/imoveis/${id}`);
  return { ok: true };
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
    highlights: v.highlights,
    neighborhood: v.neighborhood,
    ownerId: v.ownerId || null,
    listingType: v.listingType || null,
    listingStart: v.listingStart || null,
    listingEnd: v.listingEnd || null,
    commissionPct: v.commissionPct ?? null,
  };
}
