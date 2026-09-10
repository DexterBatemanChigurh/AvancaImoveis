import type { ReactNode } from "react";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/imoveis" className="font-display text-xl font-semibold">
            Avança <span className="text-accent-ink">Imóveis</span>
          </Link>
          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-wide text-muted hover:text-ink"
          >
            Falar no WhatsApp
          </a>
        </div>
      </header>

      <main className="container flex-1 py-10">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="container py-8 text-sm text-muted">
          <p>© {new Date().getFullYear()} Avança Imóveis. Todos os imóveis sujeitos a disponibilidade.</p>
        </div>
      </footer>
    </div>
  );
}
