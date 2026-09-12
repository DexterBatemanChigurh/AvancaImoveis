import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import { publicUrl } from "@/lib/storage/url";

export function LifestyleSection({ storageKey }: { storageKey: string | null }) {
  return (
    <section className="container flex flex-col gap-10 py-24 sm:py-32 lg:flex-row lg:items-center lg:gap-16">
      <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl lg:aspect-[3/4] lg:w-[58%]">
        {storageKey ? (
          <Image
            src={publicUrl(storageKey)}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(31_20%_18%),_hsl(0_0%_7%))]" />
        )}
      </Reveal>

      <Reveal delay={150} className="flex flex-col gap-6 lg:w-[42%]">
        <h2 className="text-3xl leading-tight sm:text-5xl">
          Seu próximo endereço
          <br />
          começa aqui.
        </h2>
        <p className="max-w-sm text-base leading-relaxed text-muted">
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
