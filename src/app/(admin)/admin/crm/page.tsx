import type { Metadata } from "next";

import { Placeholder } from "@/components/admin/placeholder";

export const metadata: Metadata = { title: "CRM" };

export default function CrmPage() {
  return (
    <Placeholder title="CRM" phase="Fase 2">
      <p>
        Kanban com as etapas do funil (Novo → Contato feito → Visita agendada →
        Proposta → Fechado / Perdido), arrastar-e-soltar de cards, ficha do cliente
        com imóveis de interesse e linha do tempo.
      </p>
      <p className="mt-3">
        O modelo de dados já está pronto (<code>deals</code>, <code>stages</code>,{" "}
        <code>deal_properties</code>, <code>activities</code>). Falta a UI e a Server
        Action de mover card. Dependência a instalar: <code>@dnd-kit/core</code>.
      </p>
    </Placeholder>
  );
}
