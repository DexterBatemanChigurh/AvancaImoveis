"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 20_000;

/**
 * Consulta /api/catalog-version de tempos em tempos e só atualiza a página
 * (router.refresh()) quando o catálogo muda de verdade — substitui o antigo
 * SSE (EventSource + conexão aberta o tempo todo), que dependia de estado em
 * memória de um único processo e não funciona em serverless/múltiplas
 * instâncias. Fica montado uma vez no layout público.
 */
export function LiveRefresh() {
  const router = useRouter();
  const lastVersion = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/catalog-version", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const { version } = (await res.json()) as { version: string };
        if (cancelled) return;
        if (lastVersion.current !== null && lastVersion.current !== version) {
          router.refresh();
        }
        lastVersion.current = version;
      } catch {
        // Rede instável — tenta de novo no próximo ciclo, sem quebrar a página.
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [router]);

  return null;
}
