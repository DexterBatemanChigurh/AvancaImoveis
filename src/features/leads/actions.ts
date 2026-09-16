"use server";

import { randomBytes } from "node:crypto";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  activities,
  clients,
  dealProperties,
  deals,
  properties,
  searchAlerts,
  stages,
} from "@/db/schema";
import { PUBLIC_PROPERTY_STATUSES } from "@/lib/constants";
import { env, features } from "@/lib/env";
import { getClientIp } from "@/lib/request-ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendAlertConfirmationEmail } from "@/features/alerts/notify";
import { createNotification } from "@/features/notifications/queries";
import { CONSENT_TEXT, interestFormSchema } from "./schema";

export type InterestState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Sem isso, um script enche o CRM de leads falsos em segundos.
const LEAD_LIMIT = 5;
const LEAD_WINDOW_MS = 60 * 60 * 1000;

/**
 * Cria (ou reaproveita) um lead a partir do formulário público,
 * abre um card na primeira etapa do funil e registra a atividade.
 * Dispara e-mail para a equipe se o Resend estiver configurado.
 */
export async function submitInterest(
  _prev: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`lead:${ip}`, LEAD_LIMIT, LEAD_WINDOW_MS)) {
    return { ok: false, error: "Muitas mensagens enviadas. Tente novamente mais tarde." };
  }

  const parsed = interestFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;

  const property = await db.query.properties.findFirst({
    where: and(
      eq(properties.id, v.propertyId),
      inArray(properties.status, [...PUBLIC_PROPERTY_STATUSES]),
    ),
    columns: {
      id: true,
      title: true,
      code: true,
      slug: true,
      district: true,
      city: true,
      kind: true,
      salePrice: true,
      bedrooms: true,
    },
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
          // Critérios iniciais inferidos do imóvel que gerou o lead — só pra
          // cliente novo (um já existente pode já ter critérios diferentes,
          // não sobrescreve).
          kind: property.kind,
          city: property.city,
          districts: property.district ? [property.district] : [],
        })
        .returning()
    )[0]!;

  await createNotification({
    kind: "lead",
    title: `Novo lead: ${client.name}`,
    body: `Interesse em ${property.title} (${property.code}).`,
    link: `/admin/clientes/${client.id}`,
  }).catch((err) => console.error("Falha ao criar notificação de lead:", err));

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

  // 3) "avise-me de imóveis parecidos" — vira um alerta de busca com
  // critério derivado do próprio imóvel (mesmo bairro/tipo, preço ±20%).
  // Mesma regra de confirmação por e-mail do alerta manual (evita que o
  // campo "e-mail" do formulário seja usado pra assinar terceiros).
  if (v.similarAlerts === "on" && v.email) {
    const email = v.email.trim().toLowerCase();
    const confirmToken = randomBytes(16).toString("hex");
    const needsConfirmation = features.alertEmail;

    await db
      .insert(searchAlerts)
      .values({
        email,
        district: property.district,
        kind: property.kind,
        minPrice: Math.round(property.salePrice * 0.8),
        maxPrice: Math.round(property.salePrice * 1.2),
        minBedrooms: property.bedrooms || null,
        unsubscribeToken: randomBytes(16).toString("hex"),
        confirmToken,
        confirmedAt: needsConfirmation ? null : new Date(),
        consentAt: new Date(),
      })
      .then(async () => {
        if (needsConfirmation) {
          await sendAlertConfirmationEmail({ email, confirmToken });
        }
      })
      .catch((err) => console.error("Falha ao criar alerta a partir do lead:", err));
  }

  // 4) aviso por e-mail pra equipe (opcional na Fase 1)
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
