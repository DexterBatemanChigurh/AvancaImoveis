import type { Metadata } from "next";

import { Placeholder } from "@/components/admin/placeholder";
import { listOwners } from "@/features/owners/queries";

export const metadata: Metadata = { title: "Proprietários" };

export default async function ProprietariosPage() {
  const owners = await listOwners().catch(() => []);

  return (
    <Placeholder title="Proprietários" phase="Fase 1">
      <p>
        Cadastro e lista de proprietários, com os imóveis vinculados a cada um.
        Nunca aparece no catálogo público.
      </p>
      <p className="mt-3">
        {owners.length} proprietário(s) cadastrado(s). Tabela <code>owners</code>{" "}
        criada; falta o formulário de CRUD (rápido — mesmo padrão do formulário de
        imóvel).
      </p>
    </Placeholder>
  );
}
