import type { Metadata } from "next";
import Link from "next/link";

import { unsubscribeAlert } from "@/features/alerts/actions";

export const metadata: Metadata = {
  title: "Cancelar alerta",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

export default async function CancelAlertPage({ params }: { params: Params }) {
  const { token } = await params;
  const found = await unsubscribeAlert(token).catch(() => false);

  return (
    <div className="container flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl">
        {found ? "Alerta cancelado." : "Não encontramos esse alerta."}
      </h1>
      <p className="max-w-sm text-muted">
        {found
          ? "Você não vai mais receber avisos por e-mail para essa busca."
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
