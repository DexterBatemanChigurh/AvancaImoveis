/**
 * Só monta caminhos/URLs — sem tocar em disco. Importável tanto por
 * componentes de servidor quanto de cliente (ao contrário de local.ts /
 * supabase.ts, que têm "server-only").
 */

/** Convenção de chaves no armazenamento. */
export const keys = {
  propertyPhoto: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}.webp`,
  propertyPhotoThumb: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}_thumb.webp`,
  propertyDocument: (propertyId: string, fileId: string, ext: string) =>
    `imoveis/${propertyId}/documentos/${fileId}.${ext}`,
  ownerDocument: (ownerId: string, fileId: string, ext: string) =>
    `proprietarios/${ownerId}/documentos/${fileId}.${ext}`,
};

// process.env direto (não @/lib/env): este arquivo é importado também por
// componentes client, e `env` valida SUPABASE_SERVICE_ROLE_KEY/etc. —
// segredos que não existem (nem devem existir) no bundle do navegador.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Nome do bucket — não é segredo, fica fixo aqui (única fonte da verdade,
 * usado também por lib/storage/supabase.ts). */
export const SUPABASE_STORAGE_BUCKET = "fotos-imoveis";

/** URL pública (foto) — bucket público no Supabase Storage, servido direto
 * pelo CDN deles (sem passar pela nossa função serverless). */
export function publicUrl(key: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${key}`;
}

/**
 * URL de documento — servida por src/app/(admin)/admin/documentos/[...path],
 * que exige sessão válida. Nunca usar `publicUrl` para documento: aquela
 * rota é pública de propósito (fotos do catálogo) e não faz checagem de login.
 */
export function documentUrl(key: string): string {
  return `/admin/documentos/${key}`;
}
