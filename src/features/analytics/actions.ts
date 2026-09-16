"use server";

import { db } from "@/db";
import { whatsappClicks } from "@/db/schema";

/**
 * Registra um clique em link de WhatsApp — chamado direto do client
 * (components/public/whatsapp-link.tsx), sem bloquear a navegação (o link
 * já abre em nova aba). `propertyId` ausente = contato genérico (header,
 * rodapé, botão flutuante), não preso a um imóvel específico.
 * Nunca deve quebrar o clique do visitante se falhar — chamado com
 * `.catch()` por quem usa.
 */
export async function trackWhatsappClick(propertyId?: string): Promise<void> {
  await db.insert(whatsappClicks).values({ propertyId: propertyId || null });
}
