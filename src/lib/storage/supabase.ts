import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { publicUrl, SUPABASE_STORAGE_BUCKET } from "./url";

export { publicUrl, keys } from "./url";

/**
 * Armazenamento de fotos no Supabase Storage (bucket público) — trocado do
 * disco local porque serverless (Vercel) não tem filesystem persistente
 * entre deploys/instâncias. Usa a service role key: o próprio admin panel já
 * exige sessão antes de chamar qualquer coisa aqui (ver requireUser() nas
 * Server Actions), então não precisa de RLS/policy do Supabase por cima.
 */
const globalForSupabase = globalThis as unknown as {
  _supabaseStorage?: ReturnType<typeof createClient>;
};

const client =
  globalForSupabase._supabaseStorage ??
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase._supabaseStorage = client;
}

const bucket = client.storage.from(SUPABASE_STORAGE_BUCKET);

export async function saveFile(
  key: string,
  data: Buffer | Uint8Array,
): Promise<{ key: string; url: string }> {
  const { error } = await bucket.upload(key, data, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error)
    throw new Error(
      `Falha ao enviar foto pro Supabase Storage: ${error.message}`,
    );
  return { key, url: publicUrl(key) };
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
