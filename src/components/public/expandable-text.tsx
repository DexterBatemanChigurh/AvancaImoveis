"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Texto longo com "mostrar mais/menos" — usado na descrição do imóvel. */
export function ExpandableText({ text, limit = 260 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  const shown = expanded || !isLong ? text : `${text.slice(0, limit).trimEnd()}…`;

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="whitespace-pre-line text-muted">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm font-semibold text-ink hover:opacity-70"
        >
          {expanded ? "Mostrar menos" : "Descrição completa"}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
