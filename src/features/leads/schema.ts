import { z } from "zod";

/** Formulário "Tenho interesse" da página pública do imóvel (proposta §5). */
export const interestFormSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().min(2, "Informe seu nome."),
  phone: z.string().min(8, "Informe um telefone/WhatsApp."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  consent: z.literal("on", {
    errorMap: () => ({ message: "É necessário aceitar o uso dos dados." }),
  }),
  // "Avise-me de imóveis parecidos" — só cria alerta se também tiver e-mail.
  similarAlerts: z.literal("on").optional().or(z.literal("")),
});

export type InterestFormValues = z.infer<typeof interestFormSchema>;

export const CONSENT_TEXT =
  "Autorizo a Avança Imóveis a entrar em contato sobre este e outros imóveis e a " +
  "armazenar meus dados para esse fim, conforme a LGPD.";
