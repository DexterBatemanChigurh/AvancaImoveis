import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * Fotos de fundo estáticas da home (hero, seção "estilo de vida") — NÃO
 * vêm dos imóveis cadastrados, são arquivos soltos em `public/` que só
 * mudam quando alguém troca o arquivo manualmente, sem precisar mexer em
 * código. Enquanto o arquivo não existir, a seção renderiza sem foto (ver
 * components/home/hero.tsx e lifestyle-section.tsx).
 */
function getStaticImageSrc(basename: string): string | null {
  for (const ext of EXTENSIONS) {
    const file = `${basename}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", file))) {
      return `/${file}`;
    }
  }
  return null;
}

export function getHeroImageSrc(): string | null {
  return getStaticImageSrc("hero");
}

export function getLifestyleImageSrc(): string | null {
  return getStaticImageSrc("placeholdermid");
}
