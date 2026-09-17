import "server-only";

import { VALID_UFS } from "./brazil-states";

/**
 * Todos os municípios de um estado, via API pública do IBGE — gratuita,
 * sem chave, dado oficial. Cobre os 5.570 municípios do Brasil, um
 * estado por vez (a lista completa de uma vez seria pesada demais).
 */
export async function fetchMunicipalities(uf: string): Promise<string[]> {
  if (!VALID_UFS.has(uf)) return [];

  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
    // Lista de municípios não muda — cache de 6 meses é seguro.
    { next: { revalidate: 60 * 60 * 24 * 180 } },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as Array<{ nome: string }>;
  return data.map((m) => m.nome);
}
