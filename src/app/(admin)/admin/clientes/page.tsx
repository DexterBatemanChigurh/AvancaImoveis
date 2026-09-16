import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listClientsWithDealCount } from "@/features/clients/queries";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const clients = await listClientsWithDealCount().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Clientes</h1>
        <Link href="/admin/clientes/novo">
          <Button>Novo cliente</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhum cliente cadastrado ainda. Leads do site também caem aqui
          automaticamente.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left font-mono text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Negócios</th>
                <th className="px-4 py-3">Cadastrado em</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="font-medium text-accent-ink hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.anonymizedAt && (
                      <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                        Dados anonimizados
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{LEAD_SOURCE_LABELS[c.source]}</td>
                  <td className="px-4 py-3 tabular-nums">{c.dealCount}</td>
                  <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
