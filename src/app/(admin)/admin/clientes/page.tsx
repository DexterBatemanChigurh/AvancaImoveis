import type { Metadata } from "next";

import { Placeholder } from "@/components/admin/placeholder";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientesPage() {
  return (
    <Placeholder title="Clientes" phase="Fase 2">
      <p>
        Lista de leads, ficha com critérios de busca (bairro, faixa de preço, quartos,
        vagas), histórico de atividades, botão “imóveis compatíveis” e exclusão de
        dados a pedido (LGPD).
      </p>
      <p className="mt-3">
        Tabela <code>clients</code> já criada, incluindo os campos de consentimento
        LGPD. Leads do formulário público já caem aqui via{" "}
        <code>features/leads/actions.ts</code>.
      </p>
    </Placeholder>
  );
}
