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

/**
 * Bloco de confiança/diferenciais — o que faz alguém escolher a Avança em
 * vez de rolar o feed de outro portal. Fundo carvão de propósito: fica
 * logo abaixo do Hero (ver page.tsx) e funciona como extensão dele — os
 * "cards de serviço" integrados à base do hero, não uma seção clara e
 * desconectada jogada mais embaixo na página.
 */
export function WhyUs() {
  return (
    <section className="bg-ink">
      <div className="container py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }, i) => (
            <Reveal
              key={title}
              delay={i * 100}
              className="flex flex-col gap-4 bg-ink p-8"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg text-white">{title}</h3>
              <p className="max-w-sm text-sm leading-relaxed text-white/60">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
