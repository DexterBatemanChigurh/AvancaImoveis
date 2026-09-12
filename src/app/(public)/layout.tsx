import type { ReactNode } from "react";
import Link from "next/link";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";

import { FavoritesNavLink } from "@/components/public/favorites-nav-link";
import { LiveRefresh } from "@/components/public/live-refresh";
import { AVANCA, waLink } from "@/lib/brand";

const brandDisplay = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
      <header className="border-b border-line bg-surface">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/imoveis" className="flex items-center gap-2.5">
            {/* TODO: trocar pelo arquivo real do logo (public/logo.svg) quando chegar */}
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-lg font-bold text-bg"
              style={{ fontFamily: "var(--font-brand-display)" }}
            >
              A
            </span>
            <span className="flex flex-col leading-none">
              <span
                className="text-xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-brand-display)" }}
              >
                Avança
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
                Imóveis
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            <a
              href={`tel:+${AVANCA.phoneDigits}`}
              className="hidden items-center gap-1.5 text-sm font-medium text-ink hover:opacity-70 sm:flex"
            >
              <Phone className="h-4 w-4" />
              {AVANCA.phoneDisplay}
            </a>
            <FavoritesNavLink />
            <a
              href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-85"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="container grid gap-10 py-14 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-brand-display)" }}
            >
              Avança Imóveis
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-muted">{AVANCA.about}</p>
            <p className="text-xs text-muted">Avança Imóveis faz parte do Grupo PIER7.</p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
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
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <span className="font-semibold">Onde estamos</span>
            <p className="flex items-start gap-2 text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {AVANCA.address}
            </p>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="container flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Avança Imóveis. Todos os imóveis sujeitos a disponibilidade.</p>
            <p>Frutal, MG</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
