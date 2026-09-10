import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { Property } from "@/db/schema";
import { PROPERTY_STATUS_LABELS } from "@/lib/constants";

const badge = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium font-mono uppercase tracking-wide border",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-muted border-line",
        ok: "bg-ok/10 text-ok border-ok/40",
        warn: "bg-warn/10 text-warn border-warn/40",
        danger: "bg-danger/10 text-danger border-danger/40",
        accent: "bg-accent/10 text-accent-ink border-accent/40",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}

const STATUS_TONE: Record<Property["status"], VariantProps<typeof badge>["tone"]> = {
  rascunho: "neutral",
  disponivel: "ok",
  reservado: "warn",
  vendido: "accent",
  pausado: "neutral",
};

export function PropertyStatusBadge({ status }: { status: Property["status"] }) {
  return <Badge tone={STATUS_TONE[status]}>{PROPERTY_STATUS_LABELS[status]}</Badge>;
}
