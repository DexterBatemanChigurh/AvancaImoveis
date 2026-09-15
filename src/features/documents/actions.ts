"use server";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { propertyDocuments } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/constants";
import { deleteFile, saveFile } from "@/lib/storage/documents";
import { keys } from "@/lib/storage/url";
import { documentUploadSchema } from "./schema";

const EXT_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type DocumentUploadState = ActionState;

/** Envia um documento privado (imóvel OU proprietário — nunca os dois). */
export async function uploadDocument(
  _prev: DocumentUploadState,
  formData: FormData,
): Promise<DocumentUploadState> {
  await requireUser();

  const parsed = documentUploadSchema.safeParse({
    propertyId: formData.get("propertyId") || undefined,
    ownerId: formData.get("ownerId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    label: formData.get("label"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo." };
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { ok: false, error: "Arquivo maior que 15 MB." };
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext || !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as never)) {
    return {
      ok: false,
      error: "Formato não aceito — envie PDF, JPG, PNG ou WebP.",
    };
  }

  const fileId = randomUUID();
  const key = v.propertyId
    ? keys.propertyDocument(v.propertyId, fileId, ext)
    : keys.ownerDocument(v.ownerId!, fileId, ext);

  const bytes = Buffer.from(await file.arrayBuffer());
  await saveFile(key, bytes, file.type);

  await db.insert(propertyDocuments).values({
    propertyId: v.propertyId ?? null,
    ownerId: v.ownerId ?? null,
    categoryId: v.categoryId || null,
    label: v.label,
    storageKey: key,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (v.propertyId) revalidatePath(`/admin/imoveis/${v.propertyId}`);
  if (v.ownerId) revalidatePath(`/admin/proprietarios/${v.ownerId}`);
  return { ok: true };
}

export async function deleteDocument(id: string, _formData: FormData) {
  await requireUser();

  const doc = await db.query.propertyDocuments.findFirst({
    where: eq(propertyDocuments.id, id),
  });
  if (!doc) return;

  await db.delete(propertyDocuments).where(eq(propertyDocuments.id, id));
  await deleteFile(doc.storageKey);

  if (doc.propertyId) revalidatePath(`/admin/imoveis/${doc.propertyId}`);
  if (doc.ownerId) revalidatePath(`/admin/proprietarios/${doc.ownerId}`);
}
