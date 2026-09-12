import type { Metadata } from "next";
import Link from "next/link";

import { confirmAlert } from "@/features/alerts/actions";

export const metadata: Metadata = {
  title: "Confirmar alerta",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

export default async function ConfirmAlertPage({ params }: { params: Params }) {
  const { token } = await params;
  const found = await confirmAlert(token).catch(() => false);

  return (
    <div className="container flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl">
        {found ? "Alerta confirmado!" : "Não encontramos esse alerta."}
      </h1>
      <p className="max-w-sm text-muted">
        {found
          ? "A partir de agora você recebe um e-mail quando surgir um imóvel com esses critérios."
          : "O link pode já ter sido usado antes, ou está incorreto."}
      </p>
      <Link
        href="/imoveis"
        className="mt-2 inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-semibold text-bg"
      >
        Voltar ao catálogo
      </Link>
    </div>
  );
}
