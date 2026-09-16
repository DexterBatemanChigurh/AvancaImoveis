"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, deals, properties, proposals } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import { createNotification } from "@/features/notifications/queries";
import type { ActionState } from "@/lib/action-state";
import { env, features } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { formatBRL } from "@/lib/format";
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

  const deal = await db.query.deals.findFirst({
    where: eq(deals.id, v.dealId),
    with: { client: { columns: { name: true } } },
  });
  if (!deal) return { ok: false, error: "Negócio não encontrado." };

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, v.propertyId),
    columns: { title: true },
  });

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

  await createNotification({
    kind: "proposta",
    title: `Nova proposta: ${deal.client.name}`,
    body: property ? `${formatBRL(v.value)} — ${property.title}` : formatBRL(v.value),
    link: "/admin/crm",
  }).catch((err) => console.error("Falha ao criar notificação de proposta:", err));

  if (features.leadEmail) {
    await sendEmail({
      to: env.LEADS_NOTIFY_TO!.split(",").map((s) => s.trim()),
      subject: `Nova proposta: ${deal.client.name}`,
      text:
        `Proposta de ${formatBRL(v.value)} para ${property?.title ?? "imóvel"}, ` +
        `cliente ${deal.client.name}.` +
        (v.notes ? `\nObservações: ${v.notes}` : ""),
    }).catch((err) => console.error("Falha ao enviar e-mail de proposta:", err));
  }

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
