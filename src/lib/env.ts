import { z } from "zod";

/**
 * Validação das variáveis de ambiente na inicialização.
 * Falha cedo e com mensagem clara se algo essencial estiver faltando.
 * Veja .env.example para a lista completa.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("avanca-imoveis"),
  R2_PUBLIC_HOST: z.string().url().optional(),

  RESEND_API_KEY: z.string().optional(),
  LEADS_NOTIFY_TO: z.string().optional(),
  LEADS_NOTIFY_FROM: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Variáveis de ambiente inválidas ou ausentes:\n${issues}\n` +
      "Copie .env.example para .env.local e preencha.",
  );
}

export const env = parsed.data;

/** Flags derivadas — recursos que dependem de config opcional. */
export const features = {
  storage: Boolean(
    env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_ACCOUNT_ID,
  ),
  leadEmail: Boolean(env.RESEND_API_KEY && env.LEADS_NOTIFY_TO),
};
