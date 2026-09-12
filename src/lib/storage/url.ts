/**
 * Só monta caminhos/URLs — sem tocar em disco. Importável tanto por
 * componentes de servidor quanto de cliente (ao contrário de local.ts).
 */

/** Convenção de chaves no armazenamento. */
export const keys = {
  propertyPhoto: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}.webp`,
  propertyPhotoThumb: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}_thumb.webp`,
  propertyDocument: (propertyId: string, fileId: string, ext: string) =>
    `imoveis/${propertyId}/documentos/${fileId}.${ext}`,
};

/** URL pública (foto) servida por src/app/uploads/[...path]/route.ts. */
export function publicUrl(key: string): string {
  return `/uploads/${key}`;
}

/**
 * URL de documento — servida por src/app/(admin)/admin/documentos/[...path],
 * que exige sessão válida. Nunca usar `publicUrl` para documento: aquela
 * rota é pública de propósito (fotos do catálogo) e não faz checagem de login.
 */
export function documentUrl(key: string): string {
  return `/admin/documentos/${key}`;
}
