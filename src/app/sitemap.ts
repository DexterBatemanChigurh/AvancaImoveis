import type { MetadataRoute } from "next";

import { listPublicPropertySlugs } from "@/features/properties/queries";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/imoveis"), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const slugs = await listPublicPropertySlugs();
    for (const s of slugs) {
      base.push({
        url: absoluteUrl(`/imovel/${s.slug}`),
        lastModified: s.updatedAt ?? undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Banco ainda não configurado — devolve só as rotas fixas.
  }

  return base;
}
