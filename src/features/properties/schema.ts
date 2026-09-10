import { z } from "zod";

import { MAX_PHOTOS_PER_PROPERTY } from "@/lib/constants";

/** Validação do formulário de imóvel (painel). Compartilhada por client e server. */
export const propertyFormSchema = z.object({
  title: z.string().min(3, "Informe um título."),
  code: z.string().min(1, "Informe o código interno."),
  status: z.enum(["rascunho", "disponivel", "reservado", "vendido", "pausado"]),
  kind: z.enum(["casa", "apartamento", "terreno", "comercial", "outro"]),

  salePrice: z.coerce.number().positive("Valor de venda inválido."),
  condoFee: z.coerce.number().nonnegative().optional(),
  iptuYearly: z.coerce.number().nonnegative().optional(),

  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional().or(z.literal("")),
  zipCode: z.string().optional(),
  hideExactAddress: z.coerce.boolean().default(false),

  usableArea: z.coerce.number().nonnegative().optional(),
  totalArea: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  suites: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  parkingSpots: z.coerce.number().int().nonnegative().default(0),

  description: z.string().optional(),
  features: z.array(z.string()).max(60).default([]),
  highlights: z.array(z.string()).max(30).default([]),
  neighborhood: z.array(z.string()).max(30).default([]),

  ownerId: z.string().uuid().optional().or(z.literal("")),
  listingType: z.enum(["exclusiva", "aberta"]).optional().or(z.literal("")),
  listingStart: z.string().optional(),
  listingEnd: z.string().optional(),
  commissionPct: z.coerce.number().min(0).max(100).optional(),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const MAX_PHOTOS = MAX_PHOTOS_PER_PROPERTY;
