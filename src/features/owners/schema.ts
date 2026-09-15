import { z } from "zod";

export const ownerFormSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  document: z.string().optional(),
  notes: z.string().optional(),
});

export type OwnerFormValues = z.infer<typeof ownerFormSchema>;
