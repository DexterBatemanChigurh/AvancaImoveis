import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env, features } from "@/lib/env";

/**
 * Cliente R2 (S3-compatível). Fotos e documentos ficam aqui.
 * `features.storage` indica se as credenciais foram configuradas.
 */
let _client: S3Client | null = null;

function client(): S3Client {
  if (!features.storage) {
    throw new Error(
      "R2 não configurado. Preencha R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.",
    );
  }
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

/** Monta a URL pública a partir da chave do objeto. */
export function publicUrl(key: string): string {
  const host = env.R2_PUBLIC_HOST?.replace(/\/$/, "") ?? "";
  return `${host}/${key}`;
}

export async function putObject(params: {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  cacheControl?: string;
}) {
  await client().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000, immutable",
    }),
  );
  return { key: params.key, url: publicUrl(params.key) };
}

export async function deleteObject(key: string) {
  await client().send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
  );
}

/** URL assinada para leitura temporária de documentos privados (painel). */
export async function signedGetUrl(key: string, expiresInSeconds = 300) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

/** Convenção de chaves no bucket. */
export const keys = {
  propertyPhoto: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}.webp`,
  propertyPhotoThumb: (propertyId: string, fileId: string) =>
    `imoveis/${propertyId}/fotos/${fileId}_thumb.webp`,
  propertyDocument: (propertyId: string, fileId: string, ext: string) =>
    `imoveis/${propertyId}/documentos/${fileId}.${ext}`,
};
