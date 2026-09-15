import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listOwnersWithPropertyCount } from "@/features/owners/queries";

export const metadata: Metadata = { title: "Proprietários" };

export default async function ProprietariosPage() {
  const owners = await listOwnersWithPropertyCount().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Proprietários</h1>
        <Link href="/admin/proprietarios/novo">
          <Button>Novo proprietário</Button>
        </Link>
      </div>

      {owners.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhum proprietário cadastrado. Comece por &ldquo;Novo
          proprietário&rdquo;.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left font-mono text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Imóveis</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-line hover:bg-surface-2/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/proprietarios/${o.id}`}
                      className="font-medium text-accent-ink hover:underline"
                    >
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.phone ?? "—"}</td>
                  <td className="px-4 py-3">{o.email ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{o.propertyCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
