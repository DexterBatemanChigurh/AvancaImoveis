import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocumentManager } from "@/components/admin/document-manager";
import { OwnerForm } from "@/components/admin/owner-form";
import {
  listActiveDocumentCategories,
  listDocumentsForOwner,
} from "@/features/documents/queries";
import { deleteOwner, updateOwner } from "@/features/owners/actions";
import { getOwnerById } from "@/features/owners/queries";

export const metadata: Metadata = { title: "Editar proprietário" };

type Params = Promise<{ id: string }>;

export default async function EditarProprietarioPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [owner, documents, categories] = await Promise.all([
    getOwnerById(id).catch(() => null),
    listDocumentsForOwner(id).catch(() => []),
    listActiveDocumentCategories().catch(() => []),
  ]);
  if (!owner) notFound();

  const boundUpdate = updateOwner.bind(null, id);
  const boundDelete = deleteOwner.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">{owner.name}</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-md border border-danger/40 bg-danger/10 px-3 text-sm text-danger hover:bg-danger/20"
          >
            Excluir
          </button>
        </form>
      </div>

      {owner.properties.length > 0 && (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">
            Imóveis vinculados
          </p>
          <ul className="flex flex-wrap gap-2">
            {owner.properties.map((po) => (
              <li key={po.property.id}>
                <Link
                  href={`/admin/imoveis/${po.property.id}`}
                  className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-2"
                >
                  {po.property.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <OwnerForm action={boundUpdate} owner={owner} />

      <DocumentManager
        target={{ ownerId: owner.id }}
        documents={documents}
        categories={categories}
      />
    </div>
  );
}
