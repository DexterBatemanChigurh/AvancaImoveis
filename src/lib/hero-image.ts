import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

export type StaticMedia = { src: string; type: "image" | "video" };

/**
 * Fotos/vídeos de fundo estáticos da home (hero, seção "estilo de vida") —
 * NÃO vêm dos imóveis cadastrados, são arquivos soltos em `public/` que só
 * mudam quando alguém troca o arquivo manualmente, sem precisar mexer em
 * código. Prioriza vídeo sobre imagem quando os dois existirem pro mesmo
 * nome — é o caso do hero (public/hero.mp4). Enquanto nenhum arquivo
 * existir, a seção renderiza sem mídia (ver components/home/hero.tsx e
 * lifestyle-section.tsx).
 */
function getStaticMedia(basename: string): StaticMedia | null {
  for (const ext of VIDEO_EXTENSIONS) {
    const file = `${basename}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", file))) {
      return { src: `/${file}`, type: "video" };
    }
  }
  for (const ext of IMAGE_EXTENSIONS) {
    const file = `${basename}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", file))) {
      return { src: `/${file}`, type: "image" };
    }
  }
  return null;
}

export function getHeroMedia(): StaticMedia | null {
  return getStaticMedia("hero");
}

export function getLifestyleImageSrc(): string | null {
  const media = getStaticMedia("placeholdermid");
  return media?.type === "image" ? media.src : null;
}
