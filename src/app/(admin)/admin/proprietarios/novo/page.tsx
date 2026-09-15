import type { Metadata } from "next";

import { OwnerForm } from "@/components/admin/owner-form";
import { createOwner } from "@/features/owners/actions";

export const metadata: Metadata = { title: "Novo proprietário" };

export default function NovoProprietarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Novo proprietário</h1>
      <OwnerForm action={createOwner} />
    </div>
  );
}
