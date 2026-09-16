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
 * (imóveis compatíveis) quanto na do imóvel (clientes compatíveis). Sempre
 * mostra a quantidade total, mesmo quando é zero — inclusive logo ao
 * cadastrar um imóvel novo (redireciona pra cá em vez da lista). */
export function MatchList({ title, items }: { title: string; items: MatchItem[] }) {
  const withScore = items.filter(
    (i): i is MatchItem & { result: { score: number } } => i.result.score != null,
  );
  // "Compatível" de verdade = bateu em pelo menos um critério — um score
  // 0% (nenhum critério em comum) não deveria contar como compatível.
  const compatible = withScore.filter((i) => i.result.score > 0);
  const ranked = [...compatible].sort((a, b) => b.result.score - a.result.score).slice(0, 5);

  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">{title}</p>
        <span className="text-sm font-medium">
          {compatible.length} compatíve{compatible.length === 1 ? "l" : "is"}
        </span>
      </div>

      {ranked.length === 0 ? (
        <p className="text-sm text-muted">
          {withScore.length === 0
            ? "Ninguém com critérios de busca cadastrados ainda pra comparar."
            : "Nenhuma compatibilidade encontrada por enquanto."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranked.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
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
      )}
    </div>
  );
}
