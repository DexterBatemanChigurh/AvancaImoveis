"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DocumentCategory } from "@/db/schema";
import {
  createDocumentCategory,
  moveDocumentCategory,
  updateDocumentCategory,
} from "@/features/documents/categories-actions";
import type { ActionState } from "@/lib/action-state";

export function DocumentCategoriesManager({
  categories,
}: {
  categories: DocumentCategory[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createDocumentCategory,
    { ok: false },
  );

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="text-lg">Categorias de documento</h2>
      <p className="text-sm text-muted">
        Aparecem no upload de documentos de imóveis e proprietários. Desativar
        some da lista de upload sem apagar documentos já existentes naquela
        categoria.
      </p>

      {categories.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((cat, i) => (
            <li key={cat.id} className="flex items-center gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Mover pra cima"
                  disabled={i === 0}
                  onClick={() => moveDocumentCategory(cat.id, "up")}
                  className="grid h-5 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Mover pra baixo"
                  disabled={i === categories.length - 1}
                  onClick={() => moveDocumentCategory(cat.id, "down")}
                  className="grid h-5 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <form
                action={(fd) => updateDocumentCategory(cat.id, fd)}
                className="flex flex-1 items-center gap-3"
              >
                <input
                  name="name"
                  defaultValue={cat.name}
                  required
                  className="h-9 flex-1 rounded-md border border-line bg-bg px-3 text-sm"
                />
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input type="checkbox" name="active" defaultChecked={cat.active} />
                  Ativa
                </label>
                <Button type="submit" size="sm" variant="outline">
                  Salvar
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex items-center gap-2 border-t border-line pt-3">
        <input
          name="name"
          placeholder="Nova categoria"
          required
          className="h-9 flex-1 rounded-md border border-line bg-bg px-3 text-sm"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Criando…" : "Adicionar"}
        </Button>
      </form>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </div>
  );
}
