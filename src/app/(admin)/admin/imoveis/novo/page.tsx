import type { Metadata } from "next";

import { PropertyForm } from "@/components/admin/property-form";
import { createProperty } from "@/features/properties/actions";
import { listOwners } from "@/features/owners/queries";

export const metadata: Metadata = { title: "Novo imóvel" };

export default async function NewPropertyPage() {
  const owners = await listOwners().catch(() => []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Novo imóvel</h1>
      <PropertyForm action={createProperty} owners={owners} />
    </div>
  );
}
