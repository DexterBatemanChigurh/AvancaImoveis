import { z } from "zod";

/**
 * Um documento pertence a um imóvel OU a um proprietário (nunca nenhum dos
 * dois, nunca os dois) — validado aqui, não só no banco.
 */
export const documentUploadSchema = z
  .object({
    propertyId: z.string().uuid().optional(),
    ownerId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    label: z.string().min(1, "Informe um nome pro documento."),
  })
  .refine((v) => Boolean(v.propertyId) !== Boolean(v.ownerId), {
    message: "Documento precisa pertencer a um imóvel OU a um proprietário.",
  });

export type DocumentUploadValues = z.infer<typeof documentUploadSchema>;
