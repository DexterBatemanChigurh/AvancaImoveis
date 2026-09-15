import { z } from "zod";

/**
 * Validação das variáveis de ambiente na inicialização.
 * Falha cedo e com mensagem clara se algo essencial estiver faltando.
 * Veja .env.example para a lista completa.
 */

/** Trata "" como ausente — variáveis vazias no .env não devem quebrar validações opcionais. */
const optionalStr = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional(),
);
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: optionalStr, // usado só pelas migrations; default = DATABASE_URL

  AUTH_PEPPER: optionalStr, // tempero opcional do hash de senha
  // Tempero do hash de IP (contador de views) — separado do AUTH_PEPPER de
  // propósito: são domínios de segurança diferentes (senha vs. dedupe de
  // IP) e não devem compartilhar o mesmo segredo. Se não definido, cai de
  // volta pro AUTH_PEPPER (compatibilidade com ambientes já configurados).
  IP_HASH_PEPPER: optionalStr,

  // Documentos (matrícula, contrato etc.) ainda em disco — recurso não usado
  // hoje (nenhuma tela faz upload), fica pronto pra quando existir.
  STORAGE_DIR: z.string().default("./storage/uploads"),

  // Fotos de imóvel — bucket público no Supabase Storage (ver
  // lib/storage/supabase.ts). Trocado de disco local pra isso porque
  // filesystem de serverless (Vercel) não persiste entre deploys/instâncias.
  // A URL do projeto é NEXT_PUBLIC_* de propósito: lib/storage/url.ts monta
  // a URL pública da foto tanto no servidor quanto no navegador (é só a URL
  // do bucket, não um segredo — o segredo é a service role key, essa nunca
  // sai do servidor).
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  RESEND_API_KEY: optionalStr,
  LEADS_NOTIFY_TO: optionalStr,
  LEADS_NOTIFY_FROM: optionalStr,
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
  leadEmail: Boolean(env.RESEND_API_KEY && env.LEADS_NOTIFY_TO),
  // Alerta de busca envia pro e-mail do próprio visitante — só precisa do Resend.
  alertEmail: Boolean(env.RESEND_API_KEY),
};
