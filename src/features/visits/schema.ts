import { z } from "zod";

export const visitFormSchema = z.object({
  propertyId: z.string().uuid("Selecione o imóvel."),
  clientId: z.string().uuid("Selecione o cliente."),
  dealId: z.string().uuid().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Informe data e hora."),
});
export type VisitFormValues = z.infer<typeof visitFormSchema>;

export const visitStatusSchema = z.object({
  status: z.enum(["agendada", "realizada", "cancelada", "nao_compareceu"]),
  feedback: z.string().optional(),
});
