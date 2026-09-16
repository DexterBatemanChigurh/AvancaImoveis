import { Search, ShieldCheck, TrendingUp, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/public/reveal";

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Curadoria criteriosa",
    body: "Cada imóvel da nossa seleção é escolhido a dedo — pela localização, pela luz e pelo potencial de valorização.",
  },
  {
    icon: UserCheck,
    title: "Atendimento direto",
    body: "Sem intermediários escondidos: você fala com quem conhece o imóvel, do primeiro contato até a assinatura.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança em cada etapa",
    body: "Documentação verificada e processo transparente — nunca pedimos dados ou pagamentos antes da visita.",
  },
  {
    icon: TrendingUp,
    title: "Foco em valorização",
    body: "Mais que uma venda: avaliamos o potencial de investimento de cada imóvel pensando no seu patrimônio.",
  },
];

/** Bloco de confiança/diferenciais — o que faz alguém escolher a Avança em vez de rolar o feed de outro portal. */
export function WhyUs() {
  return (
    <section className="border-t border-line bg-surface-2/60">
      <div className="container py-24 sm:py-32">
        <Reveal className="mb-12 flex flex-col gap-2 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl">Por que a Avança Imóveis</h2>
          <p className="max-w-md text-base text-muted">
            Especializada em oportunidades imobiliárias e investimento estratégico em
            Frutal e região.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {REASONS.map(({ icon: Icon, title, body }, i) => (
            <Reveal
              key={title}
              delay={i * 100}
              className="flex flex-col gap-4 border-t border-line pt-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
