import type { ReactNode } from "react";

/** Placeholder de módulo ainda não implementado (ver roadmap no README). */
export function Placeholder({
  title,
  phase,
  children,
}: {
  title: string;
  phase: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl">{title}</h1>
        <span className="rounded border border-warn/40 bg-warn/10 px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-warn">
          {phase}
        </span>
      </div>
      <div className="max-w-prose rounded-card border border-dashed border-line bg-surface p-6 text-sm text-muted">
        {children}
      </div>
    </div>
  );
}
