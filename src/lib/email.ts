import "server-only";

import { env } from "@/lib/env";

/** Envio de e-mail transacional via Resend — mesmo provedor já usado em features/alerts/notify.ts. */
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string[];
  subject: string;
  text: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.LEADS_NOTIFY_FROM ?? "Avança Imóveis <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}`);
}
