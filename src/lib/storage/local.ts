import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { publicUrl } from "./url";

export { publicUrl, keys } from "./url";

/**
 * Armazenamento em disco — pensado para rodar num volume persistente do
 * VPS (docker compose). Fotos e documentos ficam fora de `public/` para
 * não entrar no bundle do Next; são servidos por src/app/uploads/[...path].
 */
const ROOT = path.resolve(process.cwd(), env.STORAGE_DIR);

/** Resolve a chave para um caminho absoluto, barrando qualquer "../" fora de ROOT. */
function resolvePath(key: string): string {
  const full = path.resolve(ROOT, key);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) {
    throw new Error(`Chave de armazenamento inválida: ${key}`);
  }
  return full;
}

export async function saveFile(
  key: string,
  data: Buffer | Uint8Array,
): Promise<{ key: string; url: string }> {
  const full = resolvePath(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
  return { key, url: publicUrl(key) };
}

/** Lê um arquivo salvo — usado pela rota /uploads/[...path]. */
export async function readStoredFile(key: string): Promise<Buffer> {
  return readFile(resolvePath(key));
}

export async function deleteFile(key: string): Promise<void> {
  await unlink(resolvePath(key)).catch(() => {
    // já não existe — tudo bem, o objetivo é garantir que não exista mais.
  });
}
