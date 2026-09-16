import { z } from "zod";

/**
 * Número opcional vindo de <input type="number">. Sem isso, `z.coerce.number()`
 * transforma "" (campo deixado em branco) em 0 — não em "ausente" — e todo
 * campo numérico opcional viraria zero silenciosamente.
 */
export function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    schema.optional(),
  );
}
