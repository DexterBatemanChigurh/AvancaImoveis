import { Reveal } from "@/components/public/reveal";

const STATS: [string, string][] = [
  ["+8 anos", "de experiência"],
];

/**
 * Manifesto + métricas reais num único bloco carvão — reproduz a "faixa
 * escura com números" da referência sem duplicar seção: o texto
 * institucional (label + título + descrição) mora na mesma faixa que os
 * números, em vez de uma seção clara separada de uma faixa de stats à parte.
 */
export function IntroSection({
  propertiesCount,
  districtsCount,
}: {
  propertiesCount: number;
  districtsCount: number;
}) {
  const stats: [string, string][] = [
    [`+${propertiesCount}`, "Imóveis selecionados"],
    [`+${districtsCount}`, "Bairros"],
    ...STATS,
  ];

  return (
    <section className="bg-ink">
      <div className="container py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Uma nova forma de encontrar
            </p>
            <h2 className="max-w-lg text-3xl leading-tight text-white sm:text-5xl">
              Mais do que imóveis.
              <br />
              Lugares para viver.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-white/60">
              {"Cada imóvel da nossa seleção é escolhido a dedo — pela localização, pela luz, "}
              {"pelo potencial de valorização e pela forma como se encaixa na vida de quem vai morar ali."}
            </p>
          </Reveal>

          <Reveal
            delay={150}
            className="grid grid-cols-3 gap-6 self-center sm:gap-10 lg:grid-cols-1 lg:gap-8"
          >
            {stats.map(([value, label]) => (
              <div key={label} className="flex flex-col gap-1 border-t border-white/15 pt-4">
                <span className="text-3xl text-white sm:text-5xl">{value}</span>
                <span className="text-xs text-white/60 sm:text-sm">{label}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
