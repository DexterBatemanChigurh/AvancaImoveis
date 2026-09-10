import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8">
        <Link href="/imoveis" className="font-display text-xl font-semibold">
          Avança <span className="text-accent-ink">Imóveis</span>
        </Link>
        <h1 className="mb-6 mt-4 text-2xl">Painel interno</h1>
        <LoginForm next={next} />
        <p className="mt-6 text-xs text-muted">
          Acesso restrito à equipe. As contas são criadas pela administração.
        </p>
      </div>
    </div>
  );
}
