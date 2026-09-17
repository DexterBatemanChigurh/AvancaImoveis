/**
 * Rótulos e listas de domínio para a UI.
 * Os valores batem com os enums de src/db/schema/_shared.ts.
 */

export const PROPERTY_STATUS_LABELS = {
  rascunho: "Rascunho",
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
  pausado: "Pausado",
} as const;

export const PROPERTY_KIND_LABELS = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  comercial: "Comercial",
  outro: "Outro",
} as const;

export const LEAD_SOURCE_LABELS = {
  site: "Site",
  indicacao: "Indicação",
  instagram: "Instagram",
  portal: "Portal",
  outro: "Outro",
} as const;

export const VISIT_STATUS_LABELS = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  nao_compareceu: "Não compareceu",
} as const;

export const PROPOSAL_STATUS_LABELS = {
  enviada: "Enviada",
  contraproposta: "Contraproposta",
  aceita: "Aceita",
  recusada: "Recusada",
  expirada: "Expirada",
} as const;

/** Só estes status aparecem no catálogo público. */
export const PUBLIC_PROPERTY_STATUSES = ["disponivel"] as const;

/** Limite de fotos por imóvel (validado na aplicação). */
export const MAX_PHOTOS_PER_PROPERTY = 10;

/** Etapas padrão do funil — usadas no seed inicial. */
export const DEFAULT_STAGES = [
  { name: "Novo", position: 0, color: "#6b7280" },
  { name: "Contato feito", position: 1, color: "#1a6270" },
  { name: "Visita agendada", position: 2, color: "#2563eb" },
  { name: "Proposta", position: 3, color: "#9a7434" },
  { name: "Fechado", position: 4, color: "#2f7d4f", isWon: true },
  { name: "Perdido", position: 5, color: "#b91c1c", isLost: true },
] as const;

/** Categorias de documento padrão — configuráveis depois no painel. */
export const DEFAULT_DOCUMENT_CATEGORIES = [
  "Matrícula",
  "Escritura",
  "IPTU",
  "Certidões",
  "Planta",
  "Contrato de exclusividade",
  "Habite-se",
  "Documentos do proprietário",
  "Outros",
] as const;

/** Upload de documento privado (matrícula, contrato etc.). */
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
