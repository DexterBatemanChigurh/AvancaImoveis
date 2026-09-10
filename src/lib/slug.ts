/**
 * Gera o slug usado na URL pública do imóvel: /imovel/[slug].
 * Ex.: ("Casa 3 quartos", "Jardim Europa") -> "casa-3-quartos-jardim-europa-a1b2"
 * O sufixo curto garante unicidade sem expor o id.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 70);
}

export function randomSuffix(len = 4): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function buildPropertySlug(parts: {
  title: string;
  district?: string | null;
}): string {
  const base = slugify([parts.title, parts.district].filter(Boolean).join(" "));
  return `${base}-${randomSuffix()}`;
}
