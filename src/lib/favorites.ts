"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Favoritos do visitante — guardados só no navegador dele (localStorage),
 * sem exigir login. Ver proposta: recurso inspirado em portais grandes,
 * aplicado de forma simples para o tamanho do catálogo da Avança.
 */
const STORAGE_KEY = "avanca:favoritos";

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponível (modo privado, etc.) — degrada em silêncio.
  }
}

/** Notifica outras instâncias do hook na mesma aba quando a lista muda. */
const EVENT = "avanca:favoritos-changed";

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readStorage());
    setReady(true);

    const onChange = () => setIds(readStorage());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeStorage(next);
      window.dispatchEvent(new Event(EVENT));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, isFavorite, toggle, ready };
}
