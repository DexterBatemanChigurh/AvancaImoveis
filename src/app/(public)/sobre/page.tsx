import type { Metadata } from "next";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

import { AVANCA, waLink } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Conheça a Avança Imóveis — ${AVANCA.about}`,
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <article className="container flex flex-col gap-16 py-14 sm:py-20">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Sobre a Avança
        </p>
        <h1 className="max-w-2xl text-3xl leading-tight sm:text-5xl">
          Encontrar um imóvel é fácil.
          <br />
          Encontrar o lugar certo é diferente.
        </h1>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {AVANCA.about}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Avança Imóveis faz parte do Grupo PIER7.
          </p>
          <a
            href={waLink("Olá! Gostaria de falar com a equipe da Avança Imóveis.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
          >
            <MessageCircle className="h-4 w-4" />
            Fale com a gente
          </a>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-surface-2 p-6 text-sm sm:p-8">
          <span className="font-semibold">Contato</span>
          <a
            href={`tel:+${AVANCA.phoneDigits}`}
            className="flex items-center gap-2 text-muted hover:text-ink"
          >
            <Phone className="h-4 w-4 shrink-0" /> {AVANCA.phoneDisplay}
          </a>
          <a
            href={AVANCA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted hover:text-ink"
          >
            <Instagram className="h-4 w-4 shrink-0" /> {AVANCA.instagram}
          </a>
          <p className="flex items-start gap-2 text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {AVANCA.address}
          </p>
        </div>
      </div>
    </article>
  );
}
