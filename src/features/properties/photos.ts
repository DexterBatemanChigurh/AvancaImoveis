"use server";

import { randomUUID } from "node:crypto";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { properties, propertyPhotos } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import { MAX_PHOTOS_PER_PROPERTY } from "@/lib/constants";
import { deleteFile, saveFile } from "@/lib/storage/local";
import { processPropertyImage } from "@/lib/storage/images";
import { keys } from "@/lib/storage/url";

export type PhotosState = { ok: boolean; error?: string };

/** As fotos aparecem no catálogo e na página do imóvel — revalida os dois
 * (abas abertas do site público percebem via polling, ver live-refresh.tsx). */
async function revalidatePublicProperty(propertyId: string) {
  const property = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    columns: { slug: true },
  });
  revalidatePath("/imoveis");
  if (property?.slug) revalidatePath(`/imovel/${property.slug}`);
}

/** Envia uma ou mais fotos, otimiza e anexa ao imóvel. */
export async function uploadPhotos(
  propertyId: string,
  _prev: PhotosState,
  formData: FormData,
): Promise<PhotosState> {
  await requireUser();

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, error: "Selecione ao menos uma foto." };
  }

  const existing = await db.query.propertyPhotos.findMany({
    where: eq(propertyPhotos.propertyId, propertyId),
  });
  if (existing.length + files.length > MAX_PHOTOS_PER_PROPERTY) {
    return {
      ok: false,
      error: `Limite de ${MAX_PHOTOS_PER_PROPERTY} fotos por imóvel (já tem ${existing.length}).`,
    };
  }

  let position = existing.reduce((max, p) => Math.max(max, p.position), -1) + 1;
  const hasCover = existing.some((p) => p.isCover);

  for (const [i, file] of files.entries()) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const processed = await processPropertyImage(bytes);
    const fileId = randomUUID();

    const fullKey = keys.propertyPhoto(propertyId, fileId);
    const thumbKey = keys.propertyPhotoThumb(propertyId, fileId);
    await saveFile(fullKey, processed.full);
    await saveFile(thumbKey, processed.thumb);

    await db.insert(propertyPhotos).values({
      propertyId,
      storageKey: fullKey,
      thumbKey,
      position: position++,
      isCover: !hasCover && i === 0,
    });
  }

  revalidatePath(`/admin/imoveis/${propertyId}`);
  await revalidatePublicProperty(propertyId);
  return { ok: true };
}

export async function deletePhoto(photoId: string, _formData: FormData) {
  await requireUser();

  const photo = await db.query.propertyPhotos.findFirst({
    where: eq(propertyPhotos.id, photoId),
  });
  if (!photo) return;

  await db.delete(propertyPhotos).where(eq(propertyPhotos.id, photoId));
  await deleteFile(photo.storageKey);
  if (photo.thumbKey) await deleteFile(photo.thumbKey);

  if (photo.isCover) {
    const next = await db.query.propertyPhotos.findFirst({
      where: eq(propertyPhotos.propertyId, photo.propertyId),
      orderBy: [asc(propertyPhotos.position)],
    });
    if (next) {
      await db
        .update(propertyPhotos)
        .set({ isCover: true })
        .where(eq(propertyPhotos.id, next.id));
    }
  }

  revalidatePath(`/admin/imoveis/${photo.propertyId}`);
  await revalidatePublicProperty(photo.propertyId);
}

export async function setCoverPhoto(
  photoId: string,
  propertyId: string,
  _formData: FormData,
) {
  await requireUser();
  await db
    .update(propertyPhotos)
    .set({ isCover: false })
    .where(eq(propertyPhotos.propertyId, propertyId));
  await db
    .update(propertyPhotos)
    .set({ isCover: true })
    .where(eq(propertyPhotos.id, photoId));
  revalidatePath(`/admin/imoveis/${propertyId}`);
  await revalidatePublicProperty(propertyId);
}

export async function movePhoto(
  photoId: string,
  propertyId: string,
  direction: "up" | "down",
  _formData: FormData,
) {
  await requireUser();

  const list = await db.query.propertyPhotos.findMany({
    where: eq(propertyPhotos.propertyId, propertyId),
    orderBy: [asc(propertyPhotos.position)],
  });
  const idx = list.findIndex((p) => p.id === photoId);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= list.length) return;

  const a = list[idx]!;
  const b = list[swapWith]!;
  await db
    .update(propertyPhotos)
    .set({ position: b.position })
    .where(eq(propertyPhotos.id, a.id));
  await db
    .update(propertyPhotos)
    .set({ position: a.position })
    .where(eq(propertyPhotos.id, b.id));

  revalidatePath(`/admin/imoveis/${propertyId}`);
  await revalidatePublicProperty(propertyId);
}
