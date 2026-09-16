import type { Metadata } from "next";

import { listRecentActivityLogs } from "@/features/audit/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Auditoria" };

const ACTION_LABELS: Record<string, string> = {
  create: "Criação",
  update: "Edição",
  document_upload: "Upload de documento",
  document_delete: "Remoção de documento",
};

const ENTITY_LABELS: Record<string, string> = {
  property: "Imóvel",
  document: "Documento",
};

export default async function AuditoriaPage() {
  const logs = await listRecentActivityLogs().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl">Auditoria</h1>
        <p className="text-sm text-muted">
          Histórico técnico de criação/edição de imóveis e upload/remoção de
          documentos. A conta registrada é a que estava logada — como o login
          da equipe é compartilhado, identifica a conta, não necessariamente
          a pessoa.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhum registro de auditoria ainda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left font-mono text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Conta</th>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-line">
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">{log.user?.name ?? "—"}</td>
                  <td className="px-4 py-3">{ENTITY_LABELS[log.entityType] ?? log.entityType}</td>
                  <td className="px-4 py-3">{ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className="px-4 py-3 text-muted">{log.details ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
