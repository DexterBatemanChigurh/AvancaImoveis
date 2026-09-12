"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Escuta /api/events e atualiza a página sozinha quando algo muda no
 * admin — sem precisar de F5. Fica montado uma vez no layout público,
 * então a conexão persiste entre navegações dentro do site.
 */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/events");
    source.onmessage = () => router.refresh();
    // Erros (proxy caiu, etc.) — o próprio EventSource tenta reconectar sozinho.
    return () => source.close();
  }, [router]);

  return null;
}
