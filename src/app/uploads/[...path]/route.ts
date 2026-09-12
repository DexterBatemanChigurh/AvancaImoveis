import { NextResponse } from "next/server";

import { readStoredFile } from "@/lib/storage/local";

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};

type Params = Promise<{ path: string[] }>;

// Só fotos de imóvel — chave no formato imoveis/<id>/fotos/<arquivo>.<ext>.
// Documentos (matrícula, contrato etc.) NUNCA passam por aqui: são
// servidos por /admin/documentos/[...path], que exige sessão. Essa rota é
// pública de propósito (fotos aparecem no catálogo sem login), então o
// filtro abaixo é a barreira que impede um documento salvo por engano —
// ou uma futura mudança de código — de acabar exposto sem autenticação.
const PHOTO_KEY = /^imoveis\/[^/]+\/fotos\/[^/]+\.(webp|jpg|jpeg|png|gif)$/i;

/** Serve fotos de imóveis salvas em disco (ver lib/storage/local.ts). Rota pública. */
export async function GET(_request: Request, { params }: { params: Params }) {
  const { path: segments } = await params;
  const key = segments.join("/");

  if (!PHOTO_KEY.test(key)) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  try {
    const file = await readStoredFile(key);
    const ext = key.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }
}
