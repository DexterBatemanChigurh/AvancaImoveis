import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";

/**
 * `src` vem de lib/hero-image.ts (getLifestyleImageSrc) — um arquivo
 * estático em public/placeholdermid.<ext>, mesmo mecanismo do hero. Não é
 * um storageKey do Supabase, por isso usa a URL direto, sem publicUrl().
 */
export function LifestyleSection({ src }: { src: string | null }) {
  return (
    <section className="container flex flex-col gap-10 py-24 sm:py-32 lg:flex-row lg:items-center lg:gap-16">
      <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-brand lg:aspect-[3/4] lg:w-[58%]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(40_6%_20%),_hsl(40_4%_10%))]" />
        )}
      </Reveal>

      <Reveal
        delay={150}
        className="flex flex-col justify-center gap-6 rounded-brand bg-ink p-8 text-white sm:p-10 lg:w-[42%] lg:self-stretch"
      >
        <h2 className="text-3xl leading-tight sm:text-5xl">
          Seu próximo endereço
          <br />
          começa aqui.
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-white/60">
          Mais do que quatro paredes: buscamos imóveis que se encaixam no seu ritmo, na sua
          rotina e no seu jeito de viver — em bairros que fazem sentido pra você.
        </p>
        <Link href="/imoveis" className="link-underline inline-flex w-fit items-center gap-2 text-sm font-semibold">
          Explorar nossa seleção
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
