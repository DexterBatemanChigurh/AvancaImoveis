"use client";

import { useState, type ReactNode } from "react";

import { FeatureChecklist } from "./feature-checklist";

/** Duas listas de características (imóvel/condomínio) com abas — mostra só
 * a lista quando uma das duas estiver vazia (sem aba pra escolher nada). */
export function CharacteristicsTabs({
  features,
  condoFeatures,
}: {
  features: string[];
  condoFeatures: string[];
}) {
  const [tab, setTab] = useState<"imovel" | "condominio">("imovel");

  if (features.length === 0 && condoFeatures.length === 0) return null;
  if (condoFeatures.length === 0) {
    return <FeatureChecklist items={features} />;
  }
  if (features.length === 0) {
    return <FeatureChecklist items={condoFeatures} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex border-b border-line">
        <TabButton
          active={tab === "imovel"}
          onClick={() => setTab("imovel")}
          className="flex-1"
        >
          Imóvel
        </TabButton>
        <TabButton
          active={tab === "condominio"}
          onClick={() => setTab("condominio")}
          className="flex-1"
        >
          Condomínio
        </TabButton>
      </div>
      <FeatureChecklist
        key={tab}
        items={tab === "imovel" ? features : condoFeatures}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-3 text-center text-sm font-semibold transition-colors ${
        active ? "text-accent" : "text-ink/70 hover:text-ink"
      } ${className}`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-accent" />
      )}
    </button>
  );
}
