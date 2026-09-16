"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, deals, proposals } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";
import { proposalFormSchema, proposalStatusSchema } from "./schema";

export async function createProposal(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = proposalFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const deal = await db.query.deals.findFirst({ where: eq(deals.id, v.dealId) });
  if (!deal) return { ok: false, error: "Negócio não encontrado." };

  await db.insert(proposals).values({
    dealId: v.dealId,
    clientId: deal.clientId,
    propertyId: v.propertyId,
    value: v.value,
    notes: v.notes || null,
  });

  await db.insert(activities).values({
    dealId: v.dealId,
    kind: "nota",
    body: `Proposta registrada.`,
    authorId: user.id,
  });

  revalidatePath("/admin/crm");
  return { ok: true };
}

export async function updateProposalStatus(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireUser();

  const parsed = proposalStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  await db
    .update(proposals)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(proposals.id, id));

  revalidatePath("/admin/crm");
}
