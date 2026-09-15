import { NextResponse } from "next/server";

import { requireUser } from "@/features/auth/session";
import { readStoredFile } from "@/lib/storage/documents";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

type Params = Promise<{ path: string[] }>;

// Chave no formato imoveis/<id>/documentos/<arquivo>.<ext> ou
// proprietarios/<id>/documentos/<arquivo>.<ext> — nunca fotos (essas ficam
// no bucket público). Documento é sempre interno: matrícula, IPTU,
// contrato de exclusividade etc. — nunca deve ser acessível sem sessão
// válida, mesmo que a URL vaze.
const DOCUMENT_KEY =
  /^(imoveis|proprietarios)\/[^/]+\/documentos\/[^/]+\.[a-z0-9]+$/i;

/** Serve documentos privados (bucket Supabase separado). Exige sessão — nunca é público. */
export async function GET(_request: Request, { params }: { params: Params }) {
  await requireUser();

  const { path: segments } = await params;
  const key = segments.join("/");

  if (!DOCUMENT_KEY.test(key)) {
    return NextResponse.json(
      { error: "Arquivo não encontrado." },
      { status: 404 },
    );
  }

  try {
    const file = await readStoredFile(key);
    const ext = key.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        // Documento é interno — não deixa nenhum cache público guardar cópia.
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Arquivo não encontrado." },
      { status: 404 },
    );
  }
}
