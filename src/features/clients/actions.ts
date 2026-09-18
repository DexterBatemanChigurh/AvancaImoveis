"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, clients, deals, visits } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import type { ActionState } from "@/lib/action-state";
import { linesFromForm } from "@/lib/form-data";
import { clientFormSchema, noteFormSchema } from "./schema";

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return clientFormSchema.safeParse({
    ...raw,
    districts: linesFromForm(formData, "districts"),
    desiredFeatures: linesFromForm(formData, "desiredFeatures"),
  });
}

function toColumns(v: ReturnType<typeof clientFormSchema.parse>) {
  return {
    name: v.name,
    phone: v.phone || null,
    email: v.email || null,
    source: v.source,
    kind: v.kind || null,
    city: v.city || null,
    districts: v.districts,
    budgetMin: v.budgetMin ?? null,
    budgetMax: v.budgetMax ?? null,
    minBedrooms: v.minBedrooms ?? null,
    minBathrooms: v.minBathrooms ?? null,
    minParkingSpots: v.minParkingSpots ?? null,
    minArea: v.minArea ?? null,
    desiredFeatures: v.desiredFeatures,
    notes: v.notes || null,
  };
}

export async function createClient(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.insert(clients).values(toColumns(parsed.data));

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function updateClient(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(clients)
    .set({ ...toColumns(parsed.data), updatedAt: new Date() })
    .where(eq(clients.id, id));

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  redirect(`/admin/clientes/${id}`);
}

export async function addClientNote(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = noteFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.insert(activities).values({
    clientId: id,
    kind: "nota",
    body: parsed.data.body,
    authorId: user.id,
  });

  revalidatePath(`/admin/clientes/${id}`);
  return { ok: true };
}

/**
 * Exclusão PERMANENTE — diferente de `anonymizeClient` (LGPD), essa apaga o
 * cliente de verdade sem ressalva nenhuma. Todas as tabelas relacionadas
 * (deals, dealProperties, activities, visits, proposals, sales) têm
 * `ON DELETE CASCADE` até `clients.id` no próprio schema — apagar a linha
 * do cliente já arrasta tudo isso junto no banco, sem precisar de uma
 * transação manual aqui. Inclui vendas fechadas vinculadas a esse cliente:
 * se ele já comprou algo pela plataforma, esse registro de venda some
 * também — o botão na tela avisa isso antes de confirmar.
 */
export async function deleteClientPermanently(
  id: string,
  _formData: FormData,
): Promise<void> {
  await requireUser();

  await db.delete(clients).where(eq(clients.id, id));

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

/**
 * Exclusão de dados a pedido do titular (LGPD, proposta §5).
 * Se o cliente já tem negócios/visitas registrados, apagar a linha
 * arrastaria (cascade) todo o histórico comercial — em vez disso,
 * anonimiza os dados pessoais e mantém o registro para auditoria/relatórios.
 * Só apaga de verdade quando não há nenhum vínculo comercial ainda.
 */
export async function anonymizeClient(
  id: string,
  _formData: FormData,
): Promise<void> {
  await requireUser();

  const [dealCount, visitCount] = await Promise.all([
    db.select({ n: count() }).from(deals).where(eq(deals.clientId, id)),
    db.select({ n: count() }).from(visits).where(eq(visits.clientId, id)),
  ]);
  const hasHistory = (dealCount[0]?.n ?? 0) > 0 || (visitCount[0]?.n ?? 0) > 0;

  if (hasHistory) {
    await db
      .update(clients)
      .set({
        name: "Cliente anonimizado",
        phone: null,
        email: null,
        notes: null,
        districts: [],
        desiredFeatures: [],
        anonymizedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id));
  } else {
    await db.delete(clients).where(eq(clients.id, id));
  }

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}
