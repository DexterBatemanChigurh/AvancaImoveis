import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

const CANDIDATES = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"];

/**
 * Foto de fundo do hero da home — NÃO vem dos imóveis cadastrados (antes
 * vinha da capa do imóvel "em destaque" e ficava mudando sozinha conforme
 * fotos eram adicionadas/removidas). Agora é um arquivo estático que só
 * muda quando alguém troca manualmente `public/hero.<ext>` — sem precisar
 * mexer em código. Enquanto esse arquivo não existir, o hero renderiza sem
 * foto (ver components/home/hero.tsx).
 */
export function getHeroImageSrc(): string | null {
  for (const file of CANDIDATES) {
    if (existsSync(path.join(process.cwd(), "public", file))) {
      return `/${file}`;
    }
  }
  return null;
}
