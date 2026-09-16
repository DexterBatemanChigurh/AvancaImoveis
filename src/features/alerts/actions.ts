"use server";

import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { searchAlerts } from "@/db/schema";
import { features } from "@/lib/env";
import { getClientIp } from "@/lib/request-ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendAlertConfirmationEmail } from "./notify";
import { createAlertSchema } from "./schema";

export type AlertState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Sem isso, um script cria alertas em massa (spam pro próprio Resend, ou
// pra e-mails de terceiros até o clique de confirmação impedir o envio real).
const ALERT_LIMIT = 5;
const ALERT_WINDOW_MS = 60 * 60 * 1000;

/** Cria um alerta de busca — sem login, só e-mail + os filtros já aplicados na busca. */
export async function createSearchAlert(
  _prev: AlertState,
  formData: FormData,
): Promise<AlertState> {
  const ip = await getClientIp();
  if (!(await checkRateLimit(`alert:${ip}`, ALERT_LIMIT, ALERT_WINDOW_MS))) {
    return { ok: false, error: "Muitos alertas criados. Tente novamente mais tarde." };
  }

  const parsed = createAlertSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const email = v.email.trim().toLowerCase();
  const confirmToken = randomBytes(16).toString("hex");

  // Sem Resend configurado não há como confirmar por e-mail — degrada
  // ativando na hora, igual o resto do app faz com recursos opcionais.
  const needsConfirmation = features.alertEmail;

  await db.insert(searchAlerts).values({
    email,
    district: v.district || null,
    kind: v.kind || null,
    minPrice: v.minPrice ?? null,
    maxPrice: v.maxPrice ?? null,
    minBedrooms: v.minBedrooms ?? null,
    unsubscribeToken: randomBytes(16).toString("hex"),
    confirmToken,
    confirmedAt: needsConfirmation ? null : new Date(),
    consentAt: new Date(),
  });

  if (needsConfirmation) {
    await sendAlertConfirmationEmail({ email, confirmToken }).catch((err) =>
      console.error("Falha ao enviar confirmação de alerta:", err),
    );
  }

  return { ok: true };
}

/** Usado pela página de confirmação (link enviado por e-mail). */
export async function confirmAlert(token: string): Promise<boolean> {
  const [row] = await db
    .update(searchAlerts)
    .set({ confirmedAt: new Date() })
    .where(eq(searchAlerts.confirmToken, token))
    .returning({ id: searchAlerts.id });
  return Boolean(row);
}

/** Usado pelo link de cancelamento enviado no e-mail de notificação. */
export async function unsubscribeAlert(token: string): Promise<boolean> {
  const [row] = await db
    .update(searchAlerts)
    .set({ active: false })
    .where(eq(searchAlerts.unsubscribeToken, token))
    .returning({ id: searchAlerts.id });
  return Boolean(row);
}
