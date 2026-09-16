import type { Metadata } from "next";

import { DocumentCategoriesManager } from "@/components/admin/document-categories-manager";
import { StagesManager } from "@/components/admin/stages-manager";
import { listStages } from "@/features/crm/queries";
import { listDocumentCategories } from "@/features/documents/queries";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const [categories, stages] = await Promise.all([
    listDocumentCategories().catch(() => []),
    listStages().catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Configurações</h1>
      <DocumentCategoriesManager categories={categories} />
      <StagesManager stages={stages} />
    </div>
  );
}
