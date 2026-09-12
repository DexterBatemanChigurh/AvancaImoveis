import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import { AVANCA } from "@/lib/brand";

export function AboutSection() {
  return (
    <section className="border-t border-line bg-surface-2/60">
      <div className="container flex flex-col gap-8 py-24 sm:py-32 lg:flex-row lg:gap-20">
        <Reveal className="lg:w-1/2">
          <h2 className="max-w-md text-3xl leading-tight sm:text-5xl">
            Encontrar um imóvel é fácil.
            <br />
            Encontrar o lugar certo é diferente.
          </h2>
        </Reveal>
        <Reveal delay={150} className="flex flex-col gap-6 lg:w-1/2">
          <p className="max-w-md text-base leading-relaxed text-muted">{AVANCA.about}</p>
          <Link
            href="/sobre"
            className="link-underline inline-flex w-fit items-center gap-2 text-sm font-semibold"
          >
            Conheça nossa história
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
