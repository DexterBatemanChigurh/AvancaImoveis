import type { Metadata } from "next";

import { ClientForm } from "@/components/admin/client-form";
import { createClient } from "@/features/clients/actions";

export const metadata: Metadata = { title: "Novo cliente" };

export default function NovoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Novo cliente</h1>
      <ClientForm action={createClient} />
    </div>
  );
}
