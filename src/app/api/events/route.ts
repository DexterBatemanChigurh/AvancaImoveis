import { propertyEvents } from "@/lib/events";
import { releaseConnection, tryAcquireConnection } from "@/lib/rate-limit";

// Stream que nunca "termina" sozinho — nunca deixar o Next tentar
// pré-renderizar/cachear essa rota estaticamente.
export const dynamic = "force-dynamic";

function clientKey(request: Request): string {
  const h = request.headers;
  const forwarded = h.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0]!.trim() : h.get("x-real-ip")) ?? "0.0.0.0";
}

/**
 * Server-Sent Events: mantém a conexão aberta e avisa o navegador quando
 * algo muda no admin. O cliente (components/public/live-refresh.tsx) só
 * precisa de um `router.refresh()` ao receber o evento.
 *
 * Sem autenticação (é uma página pública) — por isso limita quantas
 * conexões simultâneas cada IP pode manter e um teto global, pra um
 * script não conseguir esgotar o processo Node abrindo conexões sem fim.
 */
export async function GET(request: Request) {
  const key = clientKey(request);
  if (!tryAcquireConnection(key)) {
    return new Response("Muitas conexões simultâneas.", { status: 429 });
  }

  const encoder = new TextEncoder();
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseConnection(key);
  };

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          controller.enqueue(encoder.encode("data: changed\n\n"));
        } catch {
          // conexão já encerrada — ignora
        }
      };

      // Mantém a conexão viva atrás de proxies (Caddy/nginx costumam
      // fechar conexões ociosas depois de um tempo).
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      propertyEvents.on("changed", send);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        propertyEvents.off("changed", send);
        release();
        try {
          controller.close();
        } catch {
          // já fechado — ignora
        }
      });
    },
    cancel() {
      release();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
