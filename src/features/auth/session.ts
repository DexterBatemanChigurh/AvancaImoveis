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
