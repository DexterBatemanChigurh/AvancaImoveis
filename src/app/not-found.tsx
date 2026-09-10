import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Erro 404</p>
      <h1 className="text-3xl">Página não encontrada</h1>
      <p className="text-muted">
        O imóvel pode ter saído do ar ou o link está incorreto.
      </p>
      <Link
        href="/imoveis"
        className="mt-2 inline-flex h-10 items-center rounded-md bg-accent px-4 font-medium text-white hover:bg-accent-ink"
      >
        Ver imóveis disponíveis
      </Link>
    </div>
  );
}
