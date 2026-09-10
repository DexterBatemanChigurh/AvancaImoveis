"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard indisponível — ignora
        }
      }}
    >
      {copied ? "Link copiado" : "Copiar link público"}
    </Button>
  );
}
