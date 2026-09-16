"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  History,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
  { href: "/admin/crm", label: "CRM", icon: KanbanSquare },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/visitas", label: "Visitas", icon: CalendarDays },
  { href: "/admin/proprietarios", label: "Proprietários", icon: KeyRound },
  { href: "/admin/auditoria", label: "Auditoria", icon: History },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent/10 font-medium text-accent-ink"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
