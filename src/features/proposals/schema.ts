import { z } from "zod";

export const proposalFormSchema = z.object({
  dealId: z.string().uuid(),
  propertyId: z.string().uuid("Selecione o imóvel."),
  value: z.coerce.number().positive("Informe o valor da proposta."),
  notes: z.string().optional(),
});
export type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export const proposalStatusSchema = z.object({
  status: z.enum(["enviada", "contraproposta", "aceita", "recusada", "expirada"]),
});
