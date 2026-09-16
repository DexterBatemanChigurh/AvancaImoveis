"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";

import { db, type Tx } from "@/db";
import { stages } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";

/** `isWon`/`isLost` são únicos no sistema — o fechamento de venda e a perda
 * de negócio (features/crm/actions.ts) procuram "a" etapa marcada, no
 * singular. Se duas etapas pudessem estar marcadas ao mesmo tempo, qual
 * delas seria usada ficaria arbitrário. Por isso, marcar uma etapa
 * desmarca automaticamente qualquer outra que já tivesse a mesma marca. */
async function clearOtherFlags(tx: Tx, id: string, flag: "isWon" | "isLost") {
  await tx
    .update(stages)
    .set({ [flag]: false })
    .where(and(ne(stages.id, id), eq(stages[flag], true)));
}

function parseStageForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? "#1a6270"),
    isWon: formData.get("isWon") === "on",
    isLost: formData.get("isLost") === "on",
  };
}

export async function createStage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const v = parseStageForm(formData);
  if (!v.name) return { ok: false, error: "Informe um nome." };
  if (v.isWon && v.isLost) {
    return { ok: false, error: "Uma etapa não pode ser ganho e perdido ao mesmo tempo." };
  }

  const [last] = await db
    .select({ position: stages.position })
    .from(stages)
    .orderBy(desc(stages.position))
    .limit(1);

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(stages)
      .values({ ...v, position: (last?.position ?? -1) + 1 })
      .returning({ id: stages.id });
    if (v.isWon) await clearOtherFlags(tx, inserted!.id, "isWon");
    if (v.isLost) await clearOtherFlags(tx, inserted!.id, "isLost");
  });

  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

export async function updateStage(id: string, formData: FormData): Promise<void> {
  await requireUser();
  const v = parseStageForm(formData);
  if (!v.name || (v.isWon && v.isLost)) return;

  await db.transaction(async (tx) => {
    await tx.update(stages).set({ ...v, updatedAt: new Date() }).where(eq(stages.id, id));
    if (v.isWon) await clearOtherFlags(tx, id, "isWon");
    if (v.isLost) await clearOtherFlags(tx, id, "isLost");
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/crm");
}

export async function moveStage(id: string, direction: "up" | "down"): Promise<void> {
  await requireUser();

  const [current] = await db.select().from(stages).where(eq(stages.id, id));
  if (!current) return;

  const [neighbor] = await db
    .select()
    .from(stages)
    .where(
      direction === "up"
        ? lt(stages.position, current.position)
        : gt(stages.position, current.position),
    )
    .orderBy(direction === "up" ? desc(stages.position) : asc(stages.position))
    .limit(1);
  if (!neighbor) return;

  await db.transaction(async (tx) => {
    await tx.update(stages).set({ position: neighbor.position }).where(eq(stages.id, current.id));
    await tx.update(stages).set({ position: current.position }).where(eq(stages.id, neighbor.id));
  });

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin/crm");
}
