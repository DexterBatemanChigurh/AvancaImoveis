"use client";

import { Button } from "@/components/ui/button";

/** Apaga o imóvel (e fotos/documentos/negociações ligados a ele) sem volta —
 * por isso o confirm() nativo antes de enviar o form. */
export function DeletePropertyButton({
  action,
  propertyTitle,
}: {
  action: (formData: FormData) => void | Promise<void>;
  propertyTitle: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            `Excluir "${propertyTitle}" definitivamente? Isso remove o imóvel, as fotos e o histórico de negociações ligados a ele — não tem como desfazer.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        Excluir imóvel
      </Button>
    </form>
  );
}
