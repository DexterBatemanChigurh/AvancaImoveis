import { z } from "zod";

import { optionalNumber } from "@/lib/zod-helpers";

/** Criação manual de negócio (walk-in, telefone) — leads do site já criam via features/leads. */
export const dealFormSchema = z.object({
  clientId: z.string().uuid("Selecione um cliente."),
  propertyIds: z.array(z.string().uuid()).max(10).default([]),
  title: z.string().optional(),
  estimatedValue: optionalNumber(z.coerce.number().nonnegative()),
  tags: z.array(z.string()).max(20).default([]),
  nextActionNote: z.string().optional(),
  nextActionAt: z.string().optional(),
});
export type DealFormValues = z.infer<typeof dealFormSchema>;

export const dealDetailsSchema = z.object({
  title: z.string().optional(),
  estimatedValue: optionalNumber(z.coerce.number().nonnegative()),
  tags: z.array(z.string()).max(20).default([]),
  nextActionNote: z.string().optional(),
  nextActionAt: z.string().optional(),
});
export type DealDetailsValues = z.infer<typeof dealDetailsSchema>;

export const moveDealSchema = z.object({
  dealId: z.string().uuid(),
  fromStageId: z.string().uuid(),
  toStageId: z.string().uuid(),
  // Ordem final (todos os ids) das colunas afetadas — o servidor renumera
  // TODOS os cards de cada coluna, não só o que foi arrastado, senão a
  // posição dos outros cards fica desatualizada/duplicada a cada drag.
  fromOrderedIds: z.array(z.string().uuid()).max(500),
  toOrderedIds: z.array(z.string().uuid()).max(500),
});

export const closeDealSchema = z.object({
  dealId: z.string().uuid(),
  propertyId: z.string().uuid("Selecione o imóvel vendido."),
  saleValue: z.coerce.number().positive("Informe o valor da venda."),
  saleDate: z.string().min(1, "Informe a data da venda."),
  commissionPct: optionalNumber(z.coerce.number().min(0).max(100)),
  notes: z.string().optional(),
});
export type CloseDealValues = z.infer<typeof closeDealSchema>;

export const loseDealSchema = z.object({
  dealId: z.string().uuid(),
  lostReason: z.string().min(1, "Informe o motivo da perda."),
});

export const noteFormSchema = z.object({
  body: z.string().min(1, "Escreva algo antes de salvar."),
});
