import type { Metadata } from "next";

import { AboutSection } from "@/components/home/about-section";
import { AlertSignup } from "@/components/home/alert-signup";
import { Categories } from "@/components/home/categories";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { IntroSection } from "@/components/home/intro-section";
import { LifestyleSection } from "@/components/home/lifestyle-section";
import { SearchBlock } from "@/components/home/search-block";
import { Spotlight } from "@/components/home/spotlight";
import { WhyUs } from "@/components/home/why-us";
import {
  listAvailableDistricts,
  listCategoryOverview,
  listFeaturedProperties,
  listMostViewedThisMonth,
  listPublicProperties,
} from "@/features/properties/queries";
import { getHeroMedia, getLifestyleImageSrc } from "@/lib/hero-image";

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

  // "Seu próximo endereço começa aqui" vem de public/placeholdermid.<ext>
  // (mesmo mecanismo estático do hero). A seção final (perto do rodapé)
  // continua deliberadamente sem imóvel vinculado até alguém escolher uma
  // foto de propósito pra ela.
  const lifestyleImage = getLifestyleImageSrc();
  const finalCtaImage: string | null = null;

  return (
    <div className="flex flex-col">
      <Hero media={getHeroMedia()} />
      <SearchBlock />
      <WhyUs />

      <FeaturedProperties properties={gridProperties} />
      <IntroSection propertiesCount={totals.total} districtsCount={districts.length} />
      <LifestyleSection src={lifestyleImage} />
      <Categories categories={categories} />
      <Spotlight property={spotlight} />
      <AboutSection />
      <AlertSignup />
      <FinalCta storageKey={finalCtaImage} />
    </div>
  );
}
