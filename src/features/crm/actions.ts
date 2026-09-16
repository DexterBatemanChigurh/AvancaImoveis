"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db, type Tx } from "@/db";
import { activities, dealProperties, deals, properties, sales, stages } from "@/db/schema";
import { requireUser } from "@/features/auth/session";
import { createNotification } from "@/features/notifications/queries";
import type { ActionState } from "@/lib/action-state";
import { sendEmail } from "@/lib/email";
import { env, features } from "@/lib/env";
import { linesFromForm } from "@/lib/form-data";
import { formatBRL } from "@/lib/format";
import { getDealById } from "./queries";
import {
  closeDealSchema,
  dealDetailsSchema,
  dealFormSchema,
  loseDealSchema,
  moveDealSchema,
  noteFormSchema,
} from "./schema";

/** Busca sob demanda pra abrir o painel de detalhe do card (chamada direto do client). */
export async function getDealDetail(dealId: string) {
  await requireUser();
  return getDealById(dealId);
}

async function syncDealProperties(tx: Tx, dealId: string, propertyIds: string[]) {
  await tx.delete(dealProperties).where(eq(dealProperties.dealId, dealId));
  if (propertyIds.length > 0) {
    await tx
      .insert(dealProperties)
      .values(propertyIds.map((propertyId) => ({ dealId, propertyId })))
      .onConflictDoNothing();
  }
}

export async function createDeal(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = dealFormSchema.safeParse({
    ...raw,
    propertyIds: formData.getAll("propertyIds"),
    tags: linesFromForm(formData, "tags"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const firstStage = await db.query.stages.findFirst({
    orderBy: (s, { asc }) => [asc(s.position)],
  });
  if (!firstStage) return { ok: false, error: "Nenhuma etapa de funil configurada." };

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(deals)
      .values({
        clientId: v.clientId,
        stageId: firstStage.id,
        title: v.title || null,
        estimatedValue: v.estimatedValue ?? null,
        tags: v.tags,
        nextActionNote: v.nextActionNote || null,
        nextActionAt: v.nextActionAt ? new Date(v.nextActionAt) : null,
      })
      .returning({ id: deals.id });
    await syncDealProperties(tx, inserted!.id, v.propertyIds);
  });

  revalidatePath("/admin/crm");
  redirect("/admin/crm");
}

export async function updateDealDetails(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = dealDetailsSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    tags: linesFromForm(formData, "tags"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  await db
    .update(deals)
    .set({
      title: v.title || null,
      estimatedValue: v.estimatedValue ?? null,
      tags: v.tags,
      nextActionNote: v.nextActionNote || null,
      nextActionAt: v.nextActionAt ? new Date(v.nextActionAt) : null,
      updatedAt: new Date(),
    })
    .where(eq(deals.id, id));

  revalidatePath("/admin/crm");
  return { ok: true };
}

export async function addDealNote(
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
    dealId: id,
    kind: "nota",
    body: parsed.data.body,
    authorId: user.id,
  });

  revalidatePath("/admin/crm");
  return { ok: true };
}

/**
 * Move um card entre colunas (drag-and-drop do Kanban).
 * Nunca aceita mover para uma coluna terminal (ganho/perdido) por aqui —
 * essas transições passam obrigatoriamente por `closeDeal`/`loseDeal`,
 * que registram venda/motivo antes de fechar o negócio. Sem essa checagem
 * no servidor, um drag direto na coluna "Fechado" fecharia o negócio sem
 * nenhum dado de venda.
 */
export async function moveDeal(
  input: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireUser();

  const parsed = moveDealSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };
  const v = parsed.data;

  const targetStage = await db.query.stages.findFirst({
    where: eq(stages.id, v.toStageId),
  });
  if (!targetStage) return { ok: false, error: "Etapa não encontrada." };
  if (targetStage.isWon || targetStage.isLost) {
    return {
      ok: false,
      error: "Use o fechamento de venda ou marcar como perdido para mover pra essa etapa.",
    };
  }

  await db.transaction(async (tx) => {
    if (v.fromStageId !== v.toStageId) {
      await tx
        .update(deals)
        .set({ stageId: v.toStageId, updatedAt: new Date() })
        .where(eq(deals.id, v.dealId));
    }
    for (const [index, id] of v.toOrderedIds.entries()) {
      await tx.update(deals).set({ position: index, updatedAt: new Date() }).where(eq(deals.id, id));
    }
    if (v.fromStageId !== v.toStageId) {
      for (const [index, id] of v.fromOrderedIds.entries()) {
        await tx
          .update(deals)
          .set({ position: index, updatedAt: new Date() })
          .where(eq(deals.id, id));
      }
    }
  });

  revalidatePath("/admin/crm");
  return { ok: true };
}

/**
 * Fechamento de venda — cria a venda, marca o negócio como ganho e o
 * imóvel como vendido, tudo na mesma transação (proposta de evolução §CRM).
 * Imóvel vendido some do catálogo público sozinho: toda query pública já
 * filtra por status "disponivel".
 */
export async function closeDeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = closeDealSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const [deal, wonStage] = await Promise.all([
    db.query.deals.findFirst({
      where: eq(deals.id, v.dealId),
      with: { client: { columns: { name: true } } },
    }),
    db.query.stages.findFirst({ where: eq(stages.isWon, true) }),
  ]);
  if (!deal) return { ok: false, error: "Negócio não encontrado." };
  if (!wonStage) return { ok: false, error: "Nenhuma etapa marcada como ganho." };

  const commissionValue =
    v.commissionPct != null ? (v.saleValue * v.commissionPct) / 100 : null;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(sales).values({
        dealId: v.dealId,
        clientId: deal.clientId,
        propertyId: v.propertyId,
        saleDate: new Date(v.saleDate),
        saleValue: v.saleValue,
        commissionPct: v.commissionPct ?? null,
        commissionValue,
        notes: v.notes || null,
      });
      await tx
        .update(deals)
        .set({ stageId: wonStage.id, closedAt: new Date(), updatedAt: new Date() })
        .where(eq(deals.id, v.dealId));
      await tx
        .update(properties)
        .set({ status: "vendido", updatedAt: new Date() })
        .where(eq(properties.id, v.propertyId));
      await tx.insert(activities).values({
        dealId: v.dealId,
        kind: "mudanca_etapa",
        body: "Venda registrada — negócio fechado.",
        authorId: user.id,
      });
    });
  } catch (err) {
    console.error("closeDeal:", err);
    return { ok: false, error: "Não foi possível registrar a venda (talvez já exista uma pra este negócio)." };
  }

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, v.propertyId),
    columns: { slug: true, title: true },
  });

  await createNotification({
    kind: "venda",
    title: `Venda fechada: ${deal.client.name}`,
    body: property ? `${formatBRL(v.saleValue)} — ${property.title}` : formatBRL(v.saleValue),
    link: "/admin/crm",
  }).catch((err) => console.error("Falha ao criar notificação de venda:", err));

  if (features.leadEmail) {
    await sendEmail({
      to: env.LEADS_NOTIFY_TO!.split(",").map((s) => s.trim()),
      subject: `Venda fechada: ${deal.client.name}`,
      text:
        `Venda de ${formatBRL(v.saleValue)} para ${property?.title ?? "imóvel"}, ` +
        `cliente ${deal.client.name}.` +
        (commissionValue != null ? `\nComissão: ${formatBRL(commissionValue)}` : ""),
    }).catch((err) => console.error("Falha ao enviar e-mail de venda:", err));
  }

  revalidatePath("/admin/crm");
  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
  if (property?.slug) revalidatePath(`/imovel/${property.slug}`);

  return { ok: true };
}

export async function loseDeal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = loseDealSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const lostStage = await db.query.stages.findFirst({ where: eq(stages.isLost, true) });
  if (!lostStage) return { ok: false, error: "Nenhuma etapa marcada como perdido." };

  await db.transaction(async (tx) => {
    await tx
      .update(deals)
      .set({
        stageId: lostStage.id,
        lostReason: v.lostReason,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(deals.id, v.dealId));
    await tx.insert(activities).values({
      dealId: v.dealId,
      kind: "mudanca_etapa",
      body: `Negócio perdido — ${v.lostReason}`,
      authorId: user.id,
    });
  });

  revalidatePath("/admin/crm");
  return { ok: true };
}
