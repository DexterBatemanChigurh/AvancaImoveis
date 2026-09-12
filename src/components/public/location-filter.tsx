"use client";

import { useEffect, useState } from "react";

import { BRAZIL_STATES } from "@/lib/brazil-states";

/**
 * Estado + cidade do filtro do catálogo. Cobre todos os municípios do
 * Brasil (via IBGE) — não só os que já têm imóvel cadastrado, porque a
 * ideia é já deixar pronto pra quando a Avança expandir pra outras cidades.
 * Cada escolha já filtra a página sozinha (ver AutoSubmitForm).
 *
 * Importante: o padrão é "Todos os estados" (vazio), não um estado fixo.
 * Se isso viesse pré-marcado com "MG", qualquer outro filtro que o
 * visitante mexesse (Tipo, Quartos...) reenviaria o formulário já com
 * uf=MG junto — escondendo silenciosamente imóveis de outros estados.
 */
export function LocationFilter({
  defaultUf,
  defaultCidade,
}: {
  defaultUf?: string;
  defaultCidade?: string;
}) {
  const [uf, setUf] = useState(defaultUf ?? "");
  const [cidade, setCidade] = useState(defaultCidade ?? "");
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCidades([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/municipios?uf=${uf}`)
      .then((r) => r.json())
      .then((data: { municipios?: string[] }) => {
        if (!cancelled) setCidades(data.municipios ?? []);
      })
      .catch(() => {
        if (!cancelled) setCidades([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uf]);

  return (
    <>
      <select
        name="uf"
        value={uf}
        onChange={(e) => {
          // Impede o auto-envio genérico do formulário (que dispararia com o
          // valor antigo de "cidade" ainda no DOM) — este handler cuida do
          // envio ele mesmo, já com a cidade zerada.
          e.stopPropagation();
          setUf(e.target.value);
          setCidade("");
          const form = e.currentTarget.form;
          const cidadeSelect = form?.elements.namedItem("cidade");
          if (cidadeSelect instanceof HTMLSelectElement) cidadeSelect.value = "";
          form?.requestSubmit();
        }}
        className="h-10 rounded-full border border-line bg-bg px-3.5 text-sm outline-none"
      >
        <option value="">Todos os estados</option>
        {BRAZIL_STATES.map((s) => (
          <option key={s.uf} value={s.uf}>
            {s.uf}
          </option>
        ))}
      </select>
      <select
        name="cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        disabled={loading || !uf}
        className="h-10 min-w-[9rem] rounded-full border border-line bg-bg px-3.5 text-sm outline-none disabled:opacity-60"
      >
        <option value="">{loading ? "Carregando cidades…" : "Todas as cidades"}</option>
        {cidades.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </>
  );
}
