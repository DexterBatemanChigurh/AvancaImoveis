"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Stage } from "@/db/schema";
import { createStage, moveStage, updateStage } from "@/features/stages/actions";
import type { ActionState } from "@/lib/action-state";

export function StagesManager({ stages }: { stages: Stage[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createStage, {
    ok: false,
  });

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <h2 className="text-lg">Etapas do funil (CRM)</h2>
      <p className="text-sm text-muted">
        &ldquo;Ganho&rdquo; e &ldquo;Perdido&rdquo; são únicos — marcar numa
        etapa desmarca automaticamente de qualquer outra. É pra essas duas
        colunas que o fechamento de venda e a perda de negócio no Kanban
        apontam.
      </p>

      <ul className="flex flex-col gap-2">
        {stages.map((stage, i) => (
          <li key={stage.id} className="flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Mover pra cima"
                disabled={i === 0}
                onClick={() => moveStage(stage.id, "up")}
                className="grid h-5 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Mover pra baixo"
                disabled={i === stages.length - 1}
                onClick={() => moveStage(stage.id, "down")}
                className="grid h-5 w-5 place-items-center text-muted hover:text-ink disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <form
              action={(fd) => updateStage(stage.id, fd)}
              className="flex flex-1 flex-wrap items-center gap-3"
            >
              <input
                name="name"
                defaultValue={stage.name}
                required
                className="h-9 min-w-[8rem] flex-1 rounded-md border border-line bg-bg px-3 text-sm"
              />
              <input
                name="color"
                type="color"
                defaultValue={stage.color}
                className="h-9 w-12 rounded-md border border-line bg-bg p-1"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" name="isWon" defaultChecked={stage.isWon} />
                Ganho
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" name="isLost" defaultChecked={stage.isLost} />
                Perdido
              </label>
              <Button type="submit" size="sm" variant="outline">
                Salvar
              </Button>
            </form>
          </li>
        ))}
      </ul>

      <form action={formAction} className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <input
          name="name"
          placeholder="Nova etapa"
          required
          className="h-9 min-w-[8rem] flex-1 rounded-md border border-line bg-bg px-3 text-sm"
        />
        <input
          name="color"
          type="color"
          defaultValue="#1a6270"
          className="h-9 w-12 rounded-md border border-line bg-bg p-1"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Criando…" : "Adicionar"}
        </Button>
      </form>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </div>
  );
}
