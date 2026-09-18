import type { Config } from "tailwindcss";

/**
 * Paleta da Avança Imóveis — verde-petróleo sobre papel quente.
 * Tokens ficam em CSS custom properties (globals.css) para suportar tema claro/escuro.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      // Site público mais largo em telas grandes — evita sobra de espaço
      // nas laterais quando a grade do catálogo é de 3 colunas.
      screens: { "2xl": "1800px" },
    },
    extend: {
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        ink: "hsl(var(--ink) / <alpha-value>)",
        "ink-2": "hsl(var(--ink-2) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-ink": "hsl(var(--accent-ink) / <alpha-value>)",
        "accent-soft": "hsl(var(--accent-soft) / <alpha-value>)",
        ok: "hsl(var(--ok) / <alpha-value>)",
        warn: "hsl(var(--warn) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Tipografia da marca (site público) — carregada em (public)/layout.tsx.
        brand: ["var(--font-brand-display)", "system-ui", "sans-serif"],
        "brand-sans": ["var(--font-brand-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
        brand: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
