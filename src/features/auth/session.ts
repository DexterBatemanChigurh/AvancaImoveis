import "server-only";

import { redirect } from "next/navigation";

import {
  getSessionUser as readSession,
  type SessionUser,
} from "@/lib/auth/session";

export type { SessionUser };

/** Usuário autenticado ou null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  return readSession();
}

/** Igual a getSessionUser, mas redireciona para /login se não autenticado. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Igual a requireUser, mas também exige que `role` seja um dos informados —
 * redireciona pro dashboard (não pro /login) se autenticado mas sem o papel
 * necessário. `users.role` já existe na tabela ("equipe" | "admin"), mas
 * hoje NENHUMA rota usa esse helper: o negócio pediu explicitamente "todos
 * com o mesmo nível de acesso" na Fase 1. Fica pronto pra quando alguma
 * tela (ex.: configurações, exclusão de usuário) precisar ser admin-only —
 * não decidi isso sozinho porque é uma escolha de produto, não técnica.
 */
export async function requireRole(role: string | string[]): Promise<SessionUser> {
  const user = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) redirect("/admin");
  return user;
}
