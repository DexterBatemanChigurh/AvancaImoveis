import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { NotificationBell } from "@/components/admin/notification-bell";
import { requireUser } from "@/features/auth/session";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Aplica o tema salvo ANTES da primeira pintura — sem isso, a página
          nasceria sempre no tema do sistema e só trocaria pro escolhido
          depois que o React hidratasse (flash visível do tema errado). */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
        }}
      />
      <aside className="flex flex-col gap-6 border-b border-line bg-surface p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between">
          <Link href="/admin" aria-label="Avança Imóveis">
            <Image
              src="/logo.png"
              alt="Avança Imóveis"
              width={118}
              height={90}
              priority
              className="brand-logo h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4 text-sm">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted">{user.email}</span>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="text-xs text-muted underline underline-offset-2 hover:text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="p-6 lg:p-10">{children}</div>
    </div>
  );
}
