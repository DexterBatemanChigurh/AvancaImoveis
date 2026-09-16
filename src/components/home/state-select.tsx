import { BRAZIL_STATES } from "@/lib/brazil-states";

/**
 * "Onde deseja morar" — só estado, sem cidade (a home é só a pré-busca).
 * Não navega sozinho: só quando o botão "Pesquisar" do formulário é
 * clicado (ver search-block.tsx). No /imoveis o filtro completo (cidade,
 * preço, quartos...) continua disponível pra refinar.
 */
export function StateSelect() {
  return (
    <select
      name="uf"
      defaultValue=""
      className="h-12 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-bg outline-none focus-visible:border-white/30"
    >
      <option value="" className="text-ink">
        Onde deseja morar
      </option>
      {BRAZIL_STATES.map((s) => (
        <option key={s.uf} value={s.uf} className="text-ink">
          {s.name}
        </option>
      ))}
    </select>
  );
}
