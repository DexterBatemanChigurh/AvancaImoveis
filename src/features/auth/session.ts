import "server-only";

import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Usuário autenticado + dados do espelho local (nome, papel).
 * Retorna null se não houver sessão.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const local = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  return {
    id: user.id,
    email: user.email ?? local?.email ?? "",
    name: local?.name ?? user.email ?? "Usuário",
    role: local?.role ?? "equipe",
  };
}

/** Igual a getSessionUser, mas redireciona para /login se não autenticado. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
