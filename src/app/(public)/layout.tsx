import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";

import { LiveRefresh } from "@/components/public/live-refresh";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsappFloat } from "@/components/public/whatsapp-float";
import { WhatsappLink } from "@/components/public/whatsapp-link";
import { AVANCA, waLink } from "@/lib/brand";

/**
 * Manrope pros títulos (--font-brand-display) — trocado da serifada
 * Playfair Display por pedido explícito de reposicionar a marca como
 * "tecnologia imobiliária moderna" em vez de "imobiliária editorial
 * tradicional". Geométrica, com pesos até 800, boa presença em título
 * grande sem virar decorativa.
 */
const brandDisplay = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-brand-display",
  display: "swap",
});

const brandSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand-sans",
  display: "swap",
});

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`brand-public ${brandDisplay.variable} ${brandSans.variable} min-h-screen bg-bg font-brand-sans text-ink flex flex-col`}
    >
      <LiveRefresh />
      <SiteHeader />
      <WhatsappFloat />

      <main className="flex-1">{children}</main>

      <footer className="bg-ink text-white/60">
        <div className="container grid gap-10 py-16 sm:grid-cols-[1.3fr_0.8fr_1fr_1fr] sm:py-20">
          <div className="flex flex-col gap-4">
            <Image
              src="/logo.png"
              alt="Avança Imóveis"
              width={118}
              height={90}
              className="force-invert h-10 w-auto self-start"
            />
            <p className="max-w-sm text-sm leading-relaxed">{AVANCA.about}</p>
            <p className="text-xs">Avança Imóveis faz parte do Grupo PIER7.</p>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Navegação
            </span>
            <Link href="/imoveis" className="link-underline w-fit hover:text-white">
              Imóveis
            </Link>
            <Link href="/sobre" className="link-underline w-fit hover:text-white">
              Sobre
            </Link>
            <WhatsappLink
              href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
              className="link-underline w-fit hover:text-white"
            >
              Contato
            </WhatsappLink>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Contato
            </span>
            <a
              href={`tel:+${AVANCA.phoneDigits}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0" /> {AVANCA.phoneDisplay}
            </a>
            <a
              href={AVANCA.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white"
            >
              <Instagram className="h-4 w-4 shrink-0" /> {AVANCA.instagram}
            </a>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Onde estamos
            </span>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {AVANCA.address}
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Avança Imóveis. Todos os imóveis sujeitos a disponibilidade.</p>
            <p>Frutal, MG</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
