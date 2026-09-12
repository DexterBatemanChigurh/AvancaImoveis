import type { Metadata } from "next";
import Link from "next/link";

import { Pagination } from "@/components/public/pagination";
import { PropertyStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE, listAdminProperties } from "@/features/properties/queries";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Imóveis" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.pagina && Number(sp.pagina) > 0 ? Number(sp.pagina) : 1;

  const { items: properties, total } = await listAdminProperties({ page }).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: ADMIN_PAGE_SIZE,
  }));
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Imóveis</h1>
        <Link href="/admin/imoveis/novo">
          <Button>Novo imóvel</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhum imóvel cadastrado. Comece por “Novo imóvel”.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left font-mono text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Views</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-line hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/imoveis/${p.id}`}
                      className="font-medium text-accent-ink hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-4 py-3">{p.district ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{formatBRL(p.salePrice)}</td>
                  <td className="px-4 py-3">
                    <PropertyStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{p.viewsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/imoveis"
        searchParams={sp}
      />
    </div>
  );
}
