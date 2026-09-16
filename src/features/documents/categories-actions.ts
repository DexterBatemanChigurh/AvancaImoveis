"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, gt, lt } from "drizzle-orm";

import { db } from "@/db";
import { documentCategories } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";

export async function createDocumentCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Informe um nome." };

  const [last] = await db
    .select({ position: documentCategories.position })
    .from(documentCategories)
    .orderBy(desc(documentCategories.position))
    .limit(1);

  await db.insert(documentCategories).values({
    name,
    position: (last?.position ?? -1) + 1,
  });

  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

export async function updateDocumentCategory(id: string, formData: FormData): Promise<void> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const active = formData.get("active") === "on";

  await db
    .update(documentCategories)
    .set({ name, active, updatedAt: new Date() })
    .where(eq(documentCategories.id, id));

  revalidatePath("/admin/configuracoes");
}

/** Troca a posição da categoria com a vizinha imediata — mesma UX de "subir/descer" já usada em fotos do imóvel. */
export async function moveDocumentCategory(id: string, direction: "up" | "down"): Promise<void> {
  await requireUser();

  const [current] = await db
    .select()
    .from(documentCategories)
    .where(eq(documentCategories.id, id));
  if (!current) return;

  const [neighbor] = await db
    .select()
    .from(documentCategories)
    .where(
      direction === "up"
        ? lt(documentCategories.position, current.position)
        : gt(documentCategories.position, current.position),
    )
    .orderBy(
      direction === "up" ? desc(documentCategories.position) : asc(documentCategories.position),
    )
    .limit(1);
  if (!neighbor) return;

  await db.transaction(async (tx) => {
    await tx
      .update(documentCategories)
      .set({ position: neighbor.position })
      .where(eq(documentCategories.id, current.id));
    await tx
      .update(documentCategories)
      .set({ position: current.position })
      .where(eq(documentCategories.id, neighbor.id));
  });

  revalidatePath("/admin/configuracoes");
}
