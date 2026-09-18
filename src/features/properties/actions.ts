"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db, type Tx } from "@/db";
import { properties, propertyOwners } from "@/db/schema";
import { eq } from "drizzle-orm";

import { requireUser } from "@/features/auth/session";
import { notifyMatchingAlerts } from "@/features/alerts/notify";
import { logActivity } from "@/features/audit/log";
import type { ActionState } from "@/lib/action-state";
import { formatBRL } from "@/lib/format";
import { geocodeAddressCascade } from "@/lib/geocode";
import { buildPropertySlug } from "@/lib/slug";
import { deleteFile } from "@/lib/storage/supabase";
import { linesFromForm as lines } from "@/lib/form-data";
import { propertyFormSchema } from "./schema";

/**
 * "code" é o único campo do formulário com constraint UNIQUE no banco — um
 * valor duplicado só falha na hora do INSERT/UPDATE, depois de passar pelo
 * zod. Sem isso, a violação de constraint sobe como exceção não tratada e
 * vira a tela de erro genérica do Next.js (perde o formulário inteiro, pior
 * ainda que só resetar os campos). Detecta especificamente essa constraint
 * pra devolver um fieldError normal, no mesmo formato que os erros de zod.
 *
 * Checagem por duck-typing (campos `code`/`constraint_name`), não
 * `instanceof postgres.PostgresError`: o Next.js empacota cada rota de
 * Server Action separadamente, e a rota de criação (/admin/imoveis/novo) e
 * a de edição (/admin/imoveis/[id]) acabam carregando instâncias distintas
 * do módulo "postgres" — o mesmo erro real deixa de casar num `instanceof`
 * entre bundles diferentes, mas o formato do erro (campos crus do
 * protocolo do Postgres) é sempre o mesmo.
 */
function duplicateCodeError(err: unknown): ActionState | null {
  const isUniqueViolation =
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "23505" &&
    "constraint_name" in err &&
    err.constraint_name === "properties_code_unique";

  if (!isUniqueViolation) return null;
  return {
    ok: false,
    fieldErrors: { code: ["Já existe um imóvel com esse código interno."] },
  };
}

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return propertyFormSchema.safeParse({
    ...raw,
    features: lines(formData, "features"),
    condoFeatures: lines(formData, "condoFeatures"),
    highlights: lines(formData, "highlights"),
    neighborhood: lines(formData, "neighborhood"),
    ownerIds: formData.getAll("ownerIds"),
    forceGeocode: formData.get("forceGeocode") === "on",
  });
}

export async function createProperty(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const coords = await resolveCoordinates(v, null);
  const slug = buildPropertySlug({ title: v.title, district: v.district });

  let row: { id: string };
  try {
    row = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(properties)
        .values({
          ...toColumns(v),
          ...coords,
          slug,
          publishedAt: v.status === "disponivel" ? new Date() : null,
        })
        .returning({ id: properties.id });
      await syncPropertyOwners(tx, inserted!.id, v.ownerIds);
      return inserted!;
    });
  } catch (err) {
    const duplicate = duplicateCodeError(err);
    if (duplicate) return duplicate;
    throw err;
  }

  await logActivity({
    userId: user.id,
    entityType: "property",
    entityId: row.id,
    action: "create",
    details: `Imóvel criado: ${v.title} (${v.code}), status ${v.status}, ${formatBRL(v.salePrice)}.`,
  }).catch((err) => console.error("logActivity:", err));

  if (v.status === "disponivel") {
    // Aguarda pra garantir que roda antes do redirect encerrar a resposta —
    // nunca derruba o salvamento, só loga se o e-mail falhar.
    await notifyMatchingAlerts({
      id: row.id,
      slug,
      title: v.title,
      salePrice: v.salePrice,
      district: v.district || null,
      kind: v.kind,
      bedrooms: v.bedrooms,
    }).catch((err) => console.error("notifyMatchingAlerts:", err));
  }

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
  revalidatePath("/imoveis");
  revalidatePath(`/imovel/${slug}`);
  // Vai direto pra ficha do imóvel recém-criado (não pra lista) — é lá que
  // aparece "Clientes compatíveis", satisfazendo o pedido de informar a
  // quantidade de compatíveis assim que o imóvel é cadastrado.
  redirect(`/admin/imoveis/${row.id}`);
}

export async function updateProperty(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const current = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    columns: {
      publishedAt: true,
      latitude: true,
      longitude: true,
      slug: true,
      status: true,
      salePrice: true,
    },
  });
  const coords = await resolveCoordinates(v, current ?? null);
  const isNewlyPublished = v.status === "disponivel" && !current?.publishedAt;

  try {
    await db.transaction(async (tx) => {
      await tx
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
      await syncPropertyOwners(tx, id, v.ownerIds);
    });
  } catch (err) {
    const duplicate = duplicateCodeError(err);
    if (duplicate) return duplicate;
    throw err;
  }

  const changes: string[] = [];
  if (current && current.status !== v.status) {
    changes.push(`status: ${current.status} → ${v.status}`);
  }
  if (current && current.salePrice !== v.salePrice) {
    changes.push(`preço: ${formatBRL(current.salePrice)} → ${formatBRL(v.salePrice)}`);
  }
  await logActivity({
    userId: user.id,
    entityType: "property",
    entityId: id,
    action: "update",
    details:
      changes.length > 0
        ? `Imóvel atualizado (${changes.join("; ")}).`
        : `Imóvel atualizado: ${v.title}.`,
  }).catch((err) => console.error("logActivity:", err));

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
  revalidatePath("/");
  revalidatePath("/imoveis");
  if (current?.slug) revalidatePath(`/imovel/${current.slug}`);
  redirect("/admin/imoveis");
}

/**
 * Exclui o imóvel e tudo que depende dele. As linhas de fotos/documentos/
 * visitas/negociações somem sozinhas via `onDelete: cascade` no banco — só
 * os ARQUIVOS de foto no disco precisam ser apagados à mão antes, porque
 * o cascade só cuida do banco, não do storage.
 */
export async function deleteProperty(
  id: string,
  _formData: FormData,
): Promise<void> {
  await requireUser();

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, id),
    columns: { slug: true },
    with: { photos: { columns: { storageKey: true, thumbKey: true } } },
  });
  if (!property) redirect("/admin/imoveis");

  for (const photo of property.photos) {
    await deleteFile(photo.storageKey).catch(() => {});
    if (photo.thumbKey) await deleteFile(photo.thumbKey).catch(() => {});
  }

  await db.delete(properties).where(eq(properties.id, id));

  revalidatePath("/admin/imoveis");
  revalidatePath("/");
  revalidatePath("/imoveis");
  revalidatePath(`/imovel/${property.slug}`);
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

/** Substitui todos os vínculos de proprietário do imóvel pelos informados agora. */
async function syncPropertyOwners(
  tx: Tx,
  propertyId: string,
  ownerIds: string[],
) {
  await tx
    .delete(propertyOwners)
    .where(eq(propertyOwners.propertyId, propertyId));
  if (ownerIds.length > 0) {
    await tx
      .insert(propertyOwners)
      .values(ownerIds.map((ownerId) => ({ propertyId, ownerId })));
  }
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
    listingType: v.listingType || null,
    listingStart: v.listingStart || null,
    listingEnd: v.listingEnd || null,
    commissionPct: v.commissionPct ?? null,
  };
}
