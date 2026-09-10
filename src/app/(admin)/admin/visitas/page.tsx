import type { Metadata } from "next";

import { Placeholder } from "@/components/admin/placeholder";

export const metadata: Metadata = { title: "Visitas" };

export default function VisitasPage() {
  return (
    <Placeholder title="Visitas" phase="Fase 2">
      <p>
        Agenda em lista e calendário, marcar visita como realizada, registrar
        feedback e lembrete automático antes do horário.
      </p>
      <p className="mt-3">
        Tabela <code>visits</code> já criada, com <code>remind_at</code> e{" "}
        <code>reminder_sent</code> para o job de lembrete.
      </p>
    </Placeholder>
  );
}
