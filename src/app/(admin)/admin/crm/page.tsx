import type { Metadata } from "next";
import Link from "next/link";

import { CrmBoard } from "@/components/admin/crm-board";
import { Button } from "@/components/ui/button";
import { listBoard } from "@/features/crm/queries";

export const metadata: Metadata = { title: "CRM" };

export default async function CrmPage() {
  const stages = await listBoard().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">CRM</h1>
        <Link href="/admin/crm/novo">
          <Button>Novo negócio</Button>
        </Link>
      </div>

      {stages.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
          Nenhuma etapa de funil configurada ainda.
        </p>
      ) : (
        <CrmBoard stages={stages} />
      )}
    </div>
  );
}
