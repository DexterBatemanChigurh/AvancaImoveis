/** Dados reais da Avança Imóveis — únicos, centralizados aqui. */
export const AVANCA = {
  phoneDisplay: "(34) 99990-0553",
  phoneDigits: "5534999900553",
  address: "Av. Cel. Delfino Nunes, 1111 - Centro, Frutal - MG, 38200-000",
  instagram: "@avanca_imoveis",
  instagramUrl: "https://instagram.com/avanca_imoveis",
  about:
    "Especializada em oportunidades imobiliárias e investimento estratégico. " +
    "Atuamos na compra, venda e intermediação de imóveis, conectando pessoas a " +
    "negócios que fazem sentido para os seus objetivos — com atendimento " +
    "personalizado, segurança e foco em valorização patrimonial.",
};

export function waLink(message: string): string {
  return `https://wa.me/${AVANCA.phoneDigits}?text=${encodeURIComponent(message)}`;
}
