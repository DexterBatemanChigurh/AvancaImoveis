import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * `src` vem de lib/hero-image.ts — um arquivo estático em public/hero.<ext>
 * escolhido manualmente (não a foto de nenhum imóvel cadastrado). Enquanto
 * esse arquivo não existir, renderiza sem foto de propósito.
 */
export function Hero({ src }: { src: string | null }) {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden bg-ink">
      {src ? (
        <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(31_20%_18%),_hsl(0_0%_7%))]" />
      )}
      {/* Overlay sutil — só o necessário pra legibilidade do texto, sem apagar a foto. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

      <div className="container relative z-10 flex flex-col gap-6 pb-20 pt-40 sm:pb-28">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
          Imóveis selecionados
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          Encontre um lugar
          <br />
          que tenha a sua história.
        </h1>
        <p className="max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
          Uma seleção exclusiva de imóveis escolhidos para diferentes formas de viver.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link
            href="/imoveis"
            className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
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
