import type { Metadata } from "next";

import { DealForm } from "@/components/admin/deal-form";
import { listClientsForSelect } from "@/features/clients/queries";
import { listPropertiesForSelect } from "@/features/properties/queries";

export const metadata: Metadata = { title: "Novo negócio" };

export default async function NovoNegocioPage() {
  const [clients, properties] = await Promise.all([
    listClientsForSelect().catch(() => []),
    listPropertiesForSelect().catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Novo negócio</h1>
      <DealForm clients={clients} properties={properties} />
    </div>
  );
}
