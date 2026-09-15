import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Client único do Supabase (Storage), compartilhado por todos os buckets —
 * fotos públicas (supabase.ts) e documentos privados (documents.ts). Usa a
 * service role key: cada chamador já é gated pela nossa própria sessão
 * (`requireUser()`), então não depende de RLS/policy do Supabase.
 */
const globalForSupabase = globalThis as unknown as {
  _supabaseStorage?: ReturnType<typeof createClient>;
};

export const supabaseStorageClient =
  globalForSupabase._supabaseStorage ??
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase._supabaseStorage = supabaseStorageClient;
}
