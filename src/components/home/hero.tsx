import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { StaticMedia } from "@/lib/hero-image";

/**
 * `media` vem de lib/hero-image.ts — um arquivo estático em
 * public/hero.<ext> escolhido manualmente (não a foto de nenhum imóvel
 * cadastrado). Aceita vídeo (mp4/webm, com autoplay mudo em loop) ou
 * imagem — o hero atual usa vídeo. Enquanto nenhum arquivo existir,
 * renderiza sem mídia de propósito.
 *
 * Cantos arredondados só na base (não nas 4 bordas) — de propósito: o
 * header fixo/transparente (site-header.tsx) precisa continuar cobrindo
 * 100% da largura no topo pra manter contraste correto sobre o fundo; uma
 * margem lateral no hero inteiro deixaria um respiro bege visível atrás
 * do header, quebrando o texto branco dele.
 */
export function Hero({ media }: { media: StaticMedia | null }) {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden rounded-b-[28px] bg-ink">
      {media?.type === "video" ? (
        <video
          src={media.src}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : media?.type === "image" ? (
        <Image src={media.src} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(40_6%_20%),_hsl(40_4%_10%))]" />
      )}
      {/* Overlay em duas camadas: uma base uniforme (garante um piso mínimo
          de contraste em QUALQUER frame do vídeo, já que ao contrário de
          uma foto fixa o vídeo tem cenas variáveis — algumas com céu bem
          claro) + um gradiente por cima pra dar profundidade e reforçar
          ainda mais perto do rodapé/topo, onde o texto e o header ficam. */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/35" />

      {/* Wordmark gigante — puramente gráfico/decorativo (não substitui a
          logo real do header), reproduz a escala tipográfica extrema da
          referência usando o nome real da marca, não texto inventado. */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 select-none text-center font-brand text-[22vw] font-extrabold leading-none tracking-tight text-white/10 sm:top-24"
      >
        AVANÇA
      </p>

      <div className="container relative z-10 flex flex-col gap-6 pb-20 pt-40 sm:pb-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Imóveis selecionados
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl 2xl:text-8xl">
          Encontre um lugar
          <br />
          que tenha a sua história.
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
          Uma seleção exclusiva de imóveis escolhidos para diferentes formas de viver.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-5">
          <Link
            href="/imoveis"
            className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-900 transition-transform duration-300 hover:scale-[1.02]"
          >
            Explorar imóveis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#destaques"
            className="link-underline flex h-12 items-center px-2 text-sm font-medium text-white"
          >
            Conheça nossa seleção
          </a>
        </div>
      </div>
    </section>
  );
}
