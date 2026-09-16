import { z } from "zod";

import { optionalNumber } from "@/lib/zod-helpers";

/** Formulário de cliente/lead (painel). Critérios alimentam o match (Fase E). */
export const clientFormSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  phone: z.string().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  source: z
    .enum(["site", "indicacao", "instagram", "portal", "outro"])
    .default("outro"),

  kind: z
    .enum(["casa", "apartamento", "terreno", "comercial", "outro"])
    .optional()
    .or(z.literal("")),
  city: z.string().optional(),
  districts: z.array(z.string()).max(30).default([]),
  budgetMin: optionalNumber(z.coerce.number().nonnegative()),
  budgetMax: optionalNumber(z.coerce.number().nonnegative()),
  minBedrooms: optionalNumber(z.coerce.number().int().nonnegative()),
  minBathrooms: optionalNumber(z.coerce.number().int().nonnegative()),
  minParkingSpots: optionalNumber(z.coerce.number().int().nonnegative()),
  minArea: optionalNumber(z.coerce.number().nonnegative()),
  desiredFeatures: z.array(z.string()).max(30).default([]),

  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const noteFormSchema = z.object({
  body: z.string().min(1, "Escreva algo antes de salvar."),
});
