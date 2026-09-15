"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { owners } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";
import { ownerFormSchema } from "./schema";

function parseForm(formData: FormData) {
  return ownerFormSchema.safeParse(Object.fromEntries(formData.entries()));
}

export async function createOwner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  await db.insert(owners).values({
    name: v.name,
    phone: v.phone || null,
    email: v.email || null,
    document: v.document || null,
    notes: v.notes || null,
  });

  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

export async function updateOwner(
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

  await db
    .update(owners)
    .set({
      name: v.name,
      phone: v.phone || null,
      email: v.email || null,
      document: v.document || null,
      notes: v.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(owners.id, id));

  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}

/**
 * Exclui o proprietário. Os vínculos em `property_owners` somem sozinhos
 * via cascade — o imóvel em si NUNCA é apagado (a FK lá é `set null`/N:N,
 * não arrasta o imóvel junto).
 */
export async function deleteOwner(
  id: string,
  _formData: FormData,
): Promise<void> {
  await requireUser();
  await db.delete(owners).where(eq(owners.id, id));
  revalidatePath("/admin/proprietarios");
  redirect("/admin/proprietarios");
}
