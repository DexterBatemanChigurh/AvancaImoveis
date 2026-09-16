"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, clients, properties, visits } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import { createNotification } from "@/features/notifications/queries";
import type { ActionState } from "@/lib/action-state";
import { visitFormSchema, visitStatusSchema } from "./schema";

export async function createVisit(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = visitFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const [visit] = await db
    .insert(visits)
    .values({
      propertyId: v.propertyId,
      clientId: v.clientId,
      dealId: v.dealId || null,
      scheduledAt: new Date(v.scheduledAt),
    })
    .returning({ id: visits.id });

  await db.insert(activities).values({
    clientId: v.clientId,
    dealId: v.dealId || null,
    kind: "visita",
    body: "Visita agendada.",
    authorId: user.id,
  });

  const [client, property] = await Promise.all([
    db.query.clients.findFirst({ where: eq(clients.id, v.clientId), columns: { name: true } }),
    db.query.properties.findFirst({ where: eq(properties.id, v.propertyId), columns: { title: true } }),
  ]);
  await createNotification({
    kind: "visita",
    title: `Visita agendada: ${client?.name ?? "cliente"}`,
    body: property ? `${property.title} — ${new Date(v.scheduledAt).toLocaleString("pt-BR")}` : undefined,
    link: `/admin/visitas`,
  }).catch((err) => console.error("Falha ao criar notificação de visita:", err));

  revalidatePath("/admin/visitas");
  revalidatePath("/admin/crm");
  if (visit) revalidatePath(`/admin/clientes/${v.clientId}`);
  redirect("/admin/visitas");
}

export async function updateVisitStatus(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = visitStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const visit = await db.query.visits.findFirst({ where: eq(visits.id, id) });
  if (!visit) return { ok: false, error: "Visita não encontrada." };

  await db
    .update(visits)
    .set({ status: v.status, feedback: v.feedback || null, updatedAt: new Date() })
    .where(eq(visits.id, id));

  await db.insert(activities).values({
    clientId: visit.clientId,
    dealId: visit.dealId,
    kind: "visita",
    body: `Visita marcada como "${v.status}".` + (v.feedback ? `\n${v.feedback}` : ""),
    authorId: user.id,
  });

  revalidatePath("/admin/visitas");
  revalidatePath("/admin/crm");
  return { ok: true };
}
