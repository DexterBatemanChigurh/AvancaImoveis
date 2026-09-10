"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { activities, clients, dealProperties, deals, properties, stages } from "@/db/schema";
import { env, features } from "@/lib/env";
import { CONSENT_TEXT, interestFormSchema } from "./schema";

export type InterestState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Cria (ou reaproveita) um lead a partir do formulário público,
 * abre um card na primeira etapa do funil e registra a atividade.
 * Dispara e-mail para a equipe se o Resend estiver configurado.
 */
export async function submitInterest(
  _prev: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const parsed = interestFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const property = await db.query.properties.findFirst({
    where: eq(properties.id, v.propertyId),
    columns: { id: true, title: true, code: true, slug: true },
  });
  if (!property) return { ok: false, error: "Imóvel não encontrado." };

  // 1) lead (dedup simples por telefone)
  const existing = v.phone
    ? await db.query.clients.findFirst({ where: eq(clients.phone, v.phone) })
    : undefined;

  const client =
    existing ??
    (
      await db
        .insert(clients)
        .values({
          name: v.name,
          phone: v.phone,
          email: v.email || null,
          source: "site",
          consentAt: new Date(),
          consentText: CONSENT_TEXT,
          notes: v.message || null,
        })
        .returning()
    )[0]!;

  // 2) card na primeira etapa
  const firstStage = await db.query.stages.findFirst({
    orderBy: [asc(stages.position)],
  });

  if (firstStage) {
    const [deal] = await db
      .insert(deals)
      .values({
        clientId: client.id,
        stageId: firstStage.id,
        title: `${client.name} — ${property.title}`,
      })
      .returning({ id: deals.id });

    if (deal) {
      await db
        .insert(dealProperties)
        .values({ dealId: deal.id, propertyId: property.id })
        .onConflictDoNothing();

      await db.insert(activities).values({
        clientId: client.id,
        dealId: deal.id,
        kind: "nota",
        body:
          `Lead pelo site no imóvel ${property.code}.` +
          (v.message ? `\nMensagem: ${v.message}` : ""),
      });
    }
  }

  // 3) aviso por e-mail (opcional na Fase 1)
  if (features.leadEmail) {
    await notifyTeam({
      name: v.name,
      phone: v.phone,
      email: v.email,
      message: v.message,
      propertyTitle: property.title,
      propertyUrl: `${env.NEXT_PUBLIC_SITE_URL}/imovel/${property.slug}`,
    }).catch((err) => console.error("Falha ao notificar equipe:", err));
  }

  return { ok: true };
}

async function notifyTeam(data: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  propertyTitle: string;
  propertyUrl: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.LEADS_NOTIFY_FROM ?? "Avança Imóveis <onboarding@resend.dev>",
      to: env.LEADS_NOTIFY_TO?.split(",").map((s) => s.trim()),
      subject: `Novo lead: ${data.propertyTitle}`,
      text:
        `Nome: ${data.name}\nTelefone: ${data.phone}\n` +
        `E-mail: ${data.email || "—"}\n` +
        `Mensagem: ${data.message || "—"}\n\nImóvel: ${data.propertyUrl}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
