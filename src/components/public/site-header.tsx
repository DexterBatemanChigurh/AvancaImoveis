"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Phone, X } from "lucide-react";

import { FavoritesNavLink } from "@/components/public/favorites-nav-link";
import { AVANCA, waLink } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Imóveis", href: "/imoveis" },
  { label: "Sobre", href: "/sobre" },
];

/**
 * Header do site público. Nasce transparente/sobreposto quando a página
 * já abre com uma foto grande logo no topo (home e página do imóvel — essa
 * segunda agora que a galeria ficou colada na borda) e ganha fundo sólido
 * com blur ao rolar. Nas demais páginas (sem foto por trás) já nasce
 * sólido e em fluxo normal, sem `fixed`, pra não exigir padding-top
 * artificial em toda página existente.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPropertyPage = pathname?.startsWith("/imovel/") ?? false;
  const overlayEligible = isHome || isPropertyPage;
  const [scrolled, setScrolled] = useState(!overlayEligible);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!overlayEligible) return;
    function onScroll() {
      setScrolled(window.scrollY > 64);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayEligible]);

  const overlay = overlayEligible && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-500",
        overlayEligible ? "fixed inset-x-0 top-0" : "relative border-b border-line bg-surface",
        overlayEligible && (overlay ? "border-b border-transparent bg-transparent" : "border-b border-line bg-surface/90 backdrop-blur-md"),
      )}
    >
      <div className="container grid h-20 grid-cols-[1fr_auto_1fr] items-center">
        <Link href="/" aria-label="Avança Imóveis" className="shrink-0 justify-self-start">
          <Image
            src="/logo.png"
            alt="Avança Imóveis"
            width={118}
            height={90}
            priority
            className={cn("h-10 w-auto transition-[filter] duration-500", overlay ? "force-invert" : "brand-logo")}
          />
        </Link>

        {/* Coluna do meio tem largura "auto" (só o conteúdo do nav) e as
            duas laterais são "1fr" — dividem igualmente o espaço que sobra,
            então o nav fica sempre centralizado de verdade, mesmo a logo e
            os ícones da direita tendo larguras bem diferentes entre si
            (um justify-between comum não centraliza nesse caso). */}
        <nav className="col-start-2 hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("link-underline", overlay ? "text-white" : "text-ink")}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("link-underline", overlay ? "text-white" : "text-ink")}
          >
            Contato
          </a>
        </nav>

        <div className="col-start-3 flex items-center justify-self-end gap-1 sm:gap-3">
          <a
            href={`tel:+${AVANCA.phoneDigits}`}
            className={cn(
              "hidden items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70 lg:flex",
              overlay ? "text-white" : "text-ink",
            )}
          >
            <Phone className="h-4 w-4" />
            {AVANCA.phoneDisplay}
          </a>
          <FavoritesNavLink overlay={overlay} />
          <a
            href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:flex",
              overlay ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-bg hover:opacity-85",
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-colors md:hidden",
              overlay ? "text-white" : "text-ink",
            )}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-surface md:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-surface-2"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={waLink("Olá! Vi o site da Avança Imóveis e gostaria de mais informações.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-bg"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
