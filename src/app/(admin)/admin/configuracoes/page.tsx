import type { Metadata } from "next";

import { Placeholder } from "@/components/admin/placeholder";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <Placeholder title="Configurações" phase="Fase 2">
      <p>Ajustes da operação:</p>
      <ul className="mt-2 list-disc pl-5">
        <li>Etapas do funil do CRM (nome, ordem, cor, coluna “ganhou/perdeu”).</li>
        <li>Categorias de documento dos imóveis.</li>
        <li>Usuários da equipe.</li>
      </ul>
      <p className="mt-3">
        Tabelas <code>stages</code>, <code>document_categories</code> e{" "}
        <code>users</code> já existem, com valores-padrão no seed.
      </p>
    </Placeholder>
  );
}
