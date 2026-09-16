import { z } from "zod";

import { MAX_PHOTOS_PER_PROPERTY } from "@/lib/constants";
import { optionalNumber } from "@/lib/zod-helpers";

/** Validação do formulário de imóvel (painel). Compartilhada por client e server. */
export const propertyFormSchema = z.object({
  title: z.string().min(3, "Informe um título."),
  code: z.string().min(1, "Informe o código interno."),
  status: z.enum(["rascunho", "disponivel", "reservado", "vendido", "pausado"]),
  kind: z.enum(["casa", "apartamento", "terreno", "comercial", "outro"]),

  salePrice: z.coerce.number().positive("Valor de venda inválido."),
  condoFee: optionalNumber(z.coerce.number().nonnegative()),
  iptuYearly: optionalNumber(z.coerce.number().nonnegative()),

  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  // Aceita "mg", "MG " etc. — normaliza antes de exigir 2 letras, pra não
  // rejeitar em silêncio por causa de maiúscula/espaço.
  state: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z
      .string()
      .length(2, "Use a sigla do estado, ex.: MG.")
      .optional()
      .or(z.literal("")),
  ),
  zipCode: z.string().optional(),
  // Preenchidas automaticamente por geocodificação ao salvar; só usar estes
  // campos pra corrigir manualmente quando o endereço não geocodificar bem.
  latitude: optionalNumber(z.coerce.number().min(-90).max(90)),
  longitude: optionalNumber(z.coerce.number().min(-180).max(180)),
  forceGeocode: z.coerce.boolean().default(false),

  usableArea: optionalNumber(z.coerce.number().nonnegative()),
  totalArea: optionalNumber(z.coerce.number().nonnegative()),
  bedrooms: z.coerce.number().int().nonnegative().default(0),
  suites: z.coerce.number().int().nonnegative().default(0),
  bathrooms: z.coerce.number().int().nonnegative().default(0),
  parkingSpots: z.coerce.number().int().nonnegative().default(0),

  description: z.string().optional(),
  features: z.array(z.string()).max(60).default([]),
  condoFeatures: z.array(z.string()).max(60).default([]),
  highlights: z.array(z.string()).max(30).default([]),
  neighborhood: z.array(z.string()).max(30).default([]),

  ownerIds: z.array(z.string().uuid()).max(10).default([]),
  listingType: z.enum(["exclusiva", "aberta"]).optional().or(z.literal("")),
  listingStart: z.string().optional(),
  listingEnd: z.string().optional(),
  commissionPct: optionalNumber(z.coerce.number().min(0).max(100)),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const MAX_PHOTOS = MAX_PHOTOS_PER_PROPERTY;
