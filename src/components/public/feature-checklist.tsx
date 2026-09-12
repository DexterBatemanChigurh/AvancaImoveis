"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const VISIBLE_BY_DEFAULT = 6;

/** Lista de características com check — "mostrar mais" quando passa de 6 itens. */
export function FeatureChecklist({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, VISIBLE_BY_DEFAULT);
  const hidden = items.length - visible.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {visible.map((item) => (
          <span key={item} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 shrink-0 text-ok" />
            {item}
          </span>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 self-start text-sm font-semibold text-ink hover:opacity-70"
        >
          Mostrar mais ({hidden})
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
      {expanded && items.length > VISIBLE_BY_DEFAULT && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex items-center gap-1 self-start text-sm font-semibold text-ink hover:opacity-70"
        >
          Mostrar menos
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
