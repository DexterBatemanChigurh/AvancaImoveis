"use client";

import type { FormHTMLAttributes } from "react";

/**
 * Formulário que envia sozinho quando qualquer <select> dentro dele muda —
 * é o que faz o catálogo atualizar em cascata (Estado → Cidade → Bairro →
 * Tipo...) sem precisar clicar em "Buscar". Continua sendo um <form> GET
 * de verdade — a URL reflete o filtro, dá pra copiar/compartilhar, e o
 * botão "Buscar" segue funcionando pra quem preencher os campos de preço.
 *
 * Só reage a <select>: campos de texto (preço) não enviam a cada tecla.
 */
export function AutoSubmitForm(props: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...props}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement) {
          e.currentTarget.requestSubmit();
        }
      }}
    />
  );
}
