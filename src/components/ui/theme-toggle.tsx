"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function readStoredTheme(): Theme | null {
  const v = window.localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : null;
}

/**
 * Alterna claro/escuro manualmente e guarda a escolha (localStorage) — até
 * aqui o tema seguia só a preferência do sistema. Um script inline no
 * layout do admin (ver admin/layout.tsx) já aplica o valor salvo antes da
 * hidratação, então não há flash de tema errado no primeiro carregamento.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored ?? (systemDark ? "dark" : "light"));
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
    >
      {/* Evita mismatch de hidratação: só sabemos o tema real depois do
          efeito rodar no client (localStorage/matchMedia não existem no
          servidor) — até lá, mostra um ícone neutro fixo. */}
      {theme === null ? (
        <Sun className="h-5 w-5 opacity-0" />
      ) : theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
