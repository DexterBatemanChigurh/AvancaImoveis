import "server-only";

import { and, eq, gte, isNotNull, isNull, lte, or } from "drizzle-orm";

import { db } from "@/db";
import { searchAlerts, type SearchAlert } from "@/db/schema";
import { env, features } from "@/lib/env";
import { formatBRL } from "@/lib/format";
import { absoluteUrl, propertyPath } from "@/lib/seo";

/** Só os campos do imóvel que a checagem de alerta precisa. */
export type NotifiableProperty = {
  id: string;
  slug: string;
  title: string;
  salePrice: number;
  district: string | null;
  kind: string;
  bedrooms: number;
};

/**
 * Chamado quando um imóvel passa a "disponivel" pela primeira vez
 * (ver features/properties/actions.ts). Não bloqueia o salvamento —
 * é sempre disparado com `void ....catch()`.
 */
export async function notifyMatchingAlerts(property: NotifiableProperty): Promise<void> {
  if (!features.alertEmail) return;

  const matches = await db.query.searchAlerts.findMany({
    where: and(
      eq(searchAlerts.active, true),
      // Só e-mail confirmado (double opt-in) — evita que alguém cadastre o
      // e-mail de terceiros e a gente vire fonte de spam pra essa pessoa.
      isNotNull(searchAlerts.confirmedAt),
      or(isNull(searchAlerts.district), eq(searchAlerts.district, property.district ?? "")),
      or(isNull(searchAlerts.kind), eq(searchAlerts.kind, property.kind as never)),
      or(isNull(searchAlerts.minPrice), lte(searchAlerts.minPrice, property.salePrice)),
      or(isNull(searchAlerts.maxPrice), gte(searchAlerts.maxPrice, property.salePrice)),
      or(isNull(searchAlerts.minBedrooms), lte(searchAlerts.minBedrooms, property.bedrooms)),
    ),
  });

  for (const alert of matches) {
    await sendAlertEmail(alert, property).catch((err) =>
      console.error("Falha ao notificar alerta de busca:", err),
    );
  }
}

async function sendAlertEmail(alert: SearchAlert, property: NotifiableProperty) {
  const propertyUrl = absoluteUrl(propertyPath(property.slug));
  const unsubscribeUrl = absoluteUrl(`/alertas/cancelar/${alert.unsubscribeToken}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.LEADS_NOTIFY_FROM ?? "Avança Imóveis <onboarding@resend.dev>",
      to: [alert.email],
      subject: `Novo imóvel que combina com sua busca: ${property.title}`,
      text:
        `Um imóvel novo bateu com o alerta que você criou na Avança Imóveis.\n\n` +
        `${property.title}\n${formatBRL(property.salePrice)}\n${propertyUrl}\n\n` +
        `Para parar de receber estes avisos: ${unsubscribeUrl}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);

  await db
    .update(searchAlerts)
    .set({ lastNotifiedAt: new Date() })
    .where(eq(searchAlerts.id, alert.id));
}

/**
 * E-mail de confirmação (double opt-in) — enviado na criação do alerta.
 * Só depois de clicar aqui o alerta passa a `confirmedAt` preenchido e
 * entra na checagem de `notifyMatchingAlerts`.
 */
export async function sendAlertConfirmationEmail(alert: {
  email: string;
  confirmToken: string;
}): Promise<void> {
  const confirmUrl = absoluteUrl(`/alertas/confirmar/${alert.confirmToken}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.LEADS_NOTIFY_FROM ?? "Avança Imóveis <onboarding@resend.dev>",
      to: [alert.email],
      subject: "Confirme seu alerta de busca — Avança Imóveis",
      text:
        `Recebemos um pedido de alerta de busca com este e-mail na Avança Imóveis.\n\n` +
        `Se foi você, confirme clicando aqui: ${confirmUrl}\n\n` +
        `Se não foi você, é só ignorar — nenhum alerta será ativado.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
