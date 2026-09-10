import "server-only";

import sharp from "sharp";

/**
 * Pipeline de otimização das fotos no upload (proposta §2/§8).
 * Reduz para no máx. ~2000px, converte para WebP e gera miniatura.
 * Resultado típico: 300–500 KB por foto.
 */
const MAX_EDGE = 2000;
const THUMB_EDGE = 640;
const QUALITY = 78;

export type ProcessedImage = {
  full: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
};

export async function processPropertyImage(
  input: Buffer | Uint8Array,
): Promise<ProcessedImage> {
  const base = sharp(input).rotate(); // respeita EXIF orientation

  const full = await base
    .clone()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true });

  const thumb = await base
    .clone()
    .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  return {
    full: full.data,
    thumb,
    width: full.info.width,
    height: full.info.height,
  };
}
