import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import { WhatsappLink } from "@/components/public/whatsapp-link";
import { AVANCA, waLink } from "@/lib/brand";
import { publicUrl } from "@/lib/storage/url";

export function FinalCta({ storageKey }: { storageKey: string | null }) {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-ink">
      {storageKey ? (
        <Image
          src={publicUrl(storageKey)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(31_20%_18%),_hsl(0_0%_7%))]" />
      )}
      <div className="absolute inset-0 bg-black/45" />

      <Reveal className="container relative z-10 flex flex-col items-center gap-6 py-24 text-center">
        <h2 className="max-w-xl text-3xl text-white sm:text-5xl">
          Talvez seu próximo endereço
          <br />
          esteja aqui.
        </h2>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/imoveis"
            className="flex h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            Explorar imóveis
          </Link>
          <WhatsappLink
            href={waLink("Olá! Gostaria de falar com um especialista da Avança Imóveis.")}
            className="flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com um especialista
          </WhatsappLink>
        </div>
        <p className="text-xs text-white/60">
          {AVANCA.phoneDisplay} · {AVANCA.address}
        </p>
      </Reveal>
    </section>
  );
}
