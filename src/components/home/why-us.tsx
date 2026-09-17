import { Search, ShieldCheck, TrendingUp, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/public/reveal";

const REASONS: { icon: LucideIcon; title: string; body: string; block: string }[] = [
  {
    icon: Search,
    title: "Curadoria criteriosa",
    body: "Cada imóvel da nossa seleção é escolhido a dedo — pela localização, pela luz e pelo potencial de valorização.",
    block: "bg-block-blue",
  },
  {
    icon: UserCheck,
    title: "Atendimento direto",
    body: "Sem intermediários escondidos: você fala com quem conhece o imóvel, do primeiro contato até a assinatura.",
    block: "bg-block-beige",
  },
  {
    icon: ShieldCheck,
    title: "Segurança em cada etapa",
    body: "Documentação verificada e processo transparente — nunca pedimos dados ou pagamentos antes da visita.",
    block: "bg-accent-soft",
  },
  {
    icon: TrendingUp,
    title: "Foco em valorização",
    body: "Mais que uma venda: avaliamos o potencial de investimento de cada imóvel pensando no seu patrimônio.",
    block: "bg-block-terracotta",
  },
];

/**
 * Bloco de confiança/diferenciais — o que faz alguém escolher a Avança em
 * vez de rolar o feed de outro portal. Cada item vira um bloco de cor
 * editorial (em vez de ícone+texto sobre fundo neutro) — é a principal
 * "pontuação colorida" da home, o verde institucional segue sendo usado
 * só num dos quatro (Segurança), os outros três usam os tons suaves
 * (azul/bege/terracota) reservados pra esse tipo de módulo.
 */
export function WhyUs() {
  return (
    <section className="border-t border-line">
      <div className="container py-24 sm:py-32">
        <Reveal className="mb-12 flex flex-col gap-2 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl">Por que a Avança Imóveis</h2>
          <p className="max-w-md text-base text-muted">
            Especializada em oportunidades imobiliárias e investimento estratégico em
            Frutal e região.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REASONS.map(({ icon: Icon, title, body, block }, i) => (
            <Reveal
              key={title}
              delay={i * 100}
              className={`flex flex-col gap-4 rounded-2xl p-8 ${block}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/8 text-ink">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg">{title}</h3>
              <p className="max-w-sm text-sm leading-relaxed text-ink/70">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
