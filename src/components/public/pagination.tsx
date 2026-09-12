import Link from "next/link";

/** Paginação simples (Anterior/Próxima) que preserva os demais filtros da URL. */
export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "pagina" || !value) continue;
      params.set(key, value);
    }
    if (target > 1) params.set("pagina", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-3 pt-6">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={`flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium ${
          page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-2"
        }`}
      >
        Anterior
      </Link>
      <span className="text-sm text-muted">
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={`flex h-10 items-center rounded-full border border-line px-4 text-sm font-medium ${
          page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-2"
        }`}
      >
        Próxima
      </Link>
    </nav>
  );
}
