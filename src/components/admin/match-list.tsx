import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { MatchResult } from "@/lib/match";

type MatchItem = {
  id: string;
  label: string;
  href: string;
  sub?: string;
  result: MatchResult;
};

function scoreTone(score: number) {
  if (score >= 70) return "ok" as const;
  if (score >= 40) return "warn" as const;
  return "neutral" as const;
}

/** Lista das melhores compatibilidades — usada tanto na ficha do cliente
 * (imóveis compatíveis) quanto na do imóvel (clientes compatíveis). */
export function MatchList({ title, items }: { title: string; items: MatchItem[] }) {
  const ranked = items
    .filter((i): i is MatchItem & { result: { score: number } } => i.result.score != null)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">{title}</p>
      <ul className="flex flex-col gap-2">
        {ranked.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <Link href={item.href} className="text-accent-ink hover:underline">
              {item.label}
            </Link>
            <span className="flex items-center gap-2">
              {item.sub && <span className="text-muted">{item.sub}</span>}
              <Badge tone={scoreTone(item.result.score)}>{item.result.score}%</Badge>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
