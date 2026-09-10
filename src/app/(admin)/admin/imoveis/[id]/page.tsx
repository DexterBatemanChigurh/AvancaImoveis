import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyStatusBadge } from "@/components/ui/badge";
import { updateProperty } from "@/features/properties/actions";
import { getPropertyById } from "@/features/properties/queries";
import { listOwners } from "@/features/owners/queries";
import { absoluteUrl, propertyPath } from "@/lib/seo";

export const metadata: Metadata = { title: "Editar imóvel" };

type Params = Promise<{ id: string }>;

export default async function EditPropertyPage({ params }: { params: Params }) {
  const { id } = await params;
  const [property, owners] = await Promise.all([
    getPropertyById(id).catch(() => null),
    listOwners().catch(() => []),
  ]);
  if (!property) notFound();

  const publicUrl = absoluteUrl(propertyPath(property.slug));
  const boundAction = updateProperty.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl">{property.title}</h1>
          <PropertyStatusBadge status={property.status} />
        </div>
        <div className="flex gap-2">
          <CopyLinkButton url={publicUrl} />
          {property.status === "disponivel" && (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-3 text-sm hover:bg-surface-2"
            >
              Ver no site
            </Link>
          )}
        </div>
      </div>

      <p className="text-sm text-muted">
        Upload de fotos e documentos entra na Fase 1 (ver README §Roadmap). Por ora,
        os dados textuais do imóvel já podem ser cadastrados e publicados.
      </p>

      <PropertyForm action={boundAction} property={property} owners={owners} />
    </div>
  );
}
