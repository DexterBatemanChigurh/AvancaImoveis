import { z } from "zod";

/** "" (campo em branco) deve virar "ausente", não 0 — mesmo cuidado de properties/schema.ts. */
function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());
}

export const createAlertSchema = z.object({
  email: z.string().email("E-mail inválido."),
  district: z.string().optional(),
  kind: z
    .enum(["casa", "apartamento", "terreno", "comercial", "outro"])
    .optional()
    .or(z.literal("")),
  minPrice: optionalNumber(z.coerce.number().nonnegative()),
  maxPrice: optionalNumber(z.coerce.number().nonnegative()),
  minBedrooms: optionalNumber(z.coerce.number().int().nonnegative()),
  consent: z.literal("on", {
    errorMap: () => ({ message: "É necessário aceitar o uso dos dados." }),
  }),
});

export type CreateAlertValues = z.infer<typeof createAlertSchema>;

export const ALERT_CONSENT_TEXT =
  "Autorizo a Avança Imóveis a guardar meu e-mail para avisar quando surgir um " +
  "imóvel com essas características, conforme a LGPD. Posso cancelar quando quiser.";
