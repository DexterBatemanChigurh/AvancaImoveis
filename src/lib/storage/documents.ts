import "server-only";

import { supabaseStorageClient } from "./supabase-client";

/**
 * Bucket PRIVADO — matrícula, contrato, documentos do proprietário etc.
 * Nunca tem URL pública: todo acesso passa pela nossa rota autenticada
 * (ver app/(admin)/admin/documentos/[...path]/route.ts), que chama
 * `readStoredFile` só depois de confirmar a sessão com `requireUser()`.
 */
const PRIVATE_BUCKET = "documentos-privados";

const bucket = supabaseStorageClient.storage.from(PRIVATE_BUCKET);

export async function saveFile(
  key: string,
  data: Buffer | Uint8Array,
  contentType: string,
): Promise<{ key: string }> {
  const { error } = await bucket.upload(key, data, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(
      `Falha ao enviar documento pro Supabase Storage: ${error.message}`,
    );
  }
  return { key };
}

export async function readStoredFile(key: string): Promise<Buffer> {
  const { data, error } = await bucket.download(key);
  if (error || !data) throw new Error(`Arquivo não encontrado: ${key}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteFile(key: string): Promise<void> {
  await bucket.remove([key]).catch(() => {
    // já não existe — tudo bem, o objetivo é garantir que não exista mais.
  });
}
