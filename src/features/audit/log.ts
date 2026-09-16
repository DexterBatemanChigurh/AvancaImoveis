import "server-only";

import { db } from "@/db";
import { activityLogs } from "@/db/schema";

/**
 * Grava uma linha de auditoria. NÃO é uma Server Action (sem "use server")
 * — só pode ser chamada de dentro de outro código do servidor, nunca
 * direto do client, senão qualquer um poderia forjar entradas no histórico.
 * Nunca deve derrubar a operação principal se falhar — sempre chamada com
 * `.catch()` por quem a usa.
 */
export async function logActivity(input: {
  userId: string;
  entityType: "property" | "document";
  entityId: string;
  action: "create" | "update" | "document_upload" | "document_delete";
  details?: string;
}): Promise<void> {
  await db.insert(activityLogs).values({
    userId: input.userId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    details: input.details ?? null,
  });
}
