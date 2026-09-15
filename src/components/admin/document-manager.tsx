"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { DocumentCategory, PropertyDocument } from "@/db/schema";
import { deleteDocument, uploadDocument } from "@/features/documents/actions";
import type { ActionState } from "@/lib/action-state";

type Doc = PropertyDocument & { category: DocumentCategory | null };

const initial: ActionState = { ok: false };

/** Lista + upload de documentos privados de um imóvel OU de um proprietário
 * (nunca os dois — ver features/documents/schema.ts). */
export function DocumentManager({
  target,
  documents,
  categories,
}: {
  target: { propertyId: string } | { ownerId: string };
  documents: Doc[];
  categories: DocumentCategory[];
}) {
  const [state, formAction, pending] = useActionState(uploadDocument, initial);
  const hiddenName = "propertyId" in target ? "propertyId" : "ownerId";
  const hiddenValue =
    "propertyId" in target ? target.propertyId : target.ownerId;

  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5">
      <legend className="px-1 font-mono text-xs uppercase tracking-wide text-muted">
        Documentos ({documents.length})
      </legend>

      {documents.length > 0 && (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm"
            >
              <a
                href={`/admin/documentos/${doc.storageKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-ink hover:underline"
              >
                {doc.label}
              </a>
              <span className="text-xs text-muted">
                {doc.category?.name ?? "Sem categoria"}
              </span>
              <form action={deleteDocument.bind(null, doc.id)}>
                <Button type="submit" variant="danger" size="sm">
                  Remover
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="flex flex-col gap-3 border-t border-line pt-4"
      >
        <input type="hidden" name={hiddenName} value={hiddenValue} />
        <div className="flex flex-wrap gap-3 [&>*]:min-w-[10rem] [&>*]:flex-1">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nome do documento</span>
            <input
              name="label"
              required
              className="h-10 rounded-md border border-line bg-bg px-3"
              placeholder="Ex.: Matrícula atualizada"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Categoria</span>
            <select
              name="categoryId"
              className="h-10 rounded-md border border-line bg-bg px-3"
              defaultValue=""
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <input
          type="file"
          name="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="self-start"
        >
          {pending ? "Enviando…" : "Adicionar documento"}
        </Button>
      </form>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <p className="text-xs text-muted">
        PDF, JPG, PNG ou WebP (até 15 MB). Nunca aparece no catálogo público —
        exige login pra abrir.
      </p>
    </fieldset>
  );
}
