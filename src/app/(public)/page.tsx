import type { Metadata } from "next";

import { AboutSection } from "@/components/home/about-section";
import { Categories } from "@/components/home/categories";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { IntroSection } from "@/components/home/intro-section";
import { LifestyleSection } from "@/components/home/lifestyle-section";
import { SearchBlock } from "@/components/home/search-block";
import { Spotlight } from "@/components/home/spotlight";
import {
  listAvailableDistricts,
  listCategoryOverview,
  listFeaturedProperties,
  listMostViewedThisMonth,
  listPublicProperties,
} from "@/features/properties/queries";
import { getHeroImageSrc } from "@/lib/hero-image";

export const metadata: Metadata = {
  // "absolute": ignora o template "%s · Avança Imóveis" do layout raiz —
  // esse título já é o nome completo da marca, sem precisar do sufixo.
  title: { absolute: "Avança Imóveis — Imóveis selecionados em Frutal, MG" },
  description:
    "Uma seleção exclusiva de imóveis à venda em Frutal e região, escolhidos para diferentes formas de viver.",
};

export const revalidate = 300;

export default async function HomePage() {
  const [gridProperties, monthlyTop, categories, districts, totals] = await Promise.all([
    // "Imóveis em destaque" — os 3 mais vistos (total acumulado).
    listFeaturedProperties(3).catch(() => []),
    // "Imóvel do mês" — o mais visto dentro do mês corrente.
    listMostViewedThisMonth(1).catch(() => []),
    listCategoryOverview().catch(() => []),
    listAvailableDistricts().catch(() => []),
    listPublicProperties({ pageSize: 1 }).catch(() => ({ total: 0 })),
  ]);

  const spotlight = monthlyTop[0] ?? null;

  // "Seu próximo endereço começa aqui" e a seção final (perto do rodapé) —
  // deliberadamente sem imóvel vinculado (mesmo tratamento do hero): ficam
  // como placeholder até alguém escolher uma imagem de propósito pra elas.
  const lifestyleImage: string | null = null;
  const finalCtaImage: string | null = null;

  return (
    <div className="flex flex-col">
      <Hero src={getHeroImageSrc()} />
      <SearchBlock />

      <IntroSection propertiesCount={totals.total} districtsCount={districts.length} />
      <FeaturedProperties properties={gridProperties} />
      <LifestyleSection storageKey={lifestyleImage} />
      <Categories categories={categories} />
      <Spotlight property={spotlight} />
      <AboutSection />
      <FinalCta storageKey={finalCtaImage} />
    </div>
  );
}
