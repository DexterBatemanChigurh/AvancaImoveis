"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getClientIp } from "@/lib/request-ip";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

// scrypt já é lento por natureza, mas isso não impede tentativas distribuídas
// nem enumeração de e-mails por força bruta — por IP, no máximo 10 tentativas
// a cada 10 minutos.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  if (!(await checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS))) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Mesma resposta para usuário inexistente e senha errada.
  const ok =
    user && user.active && (await verifyPassword(parsed.data.password, user.passwordHash));
  if (!ok || !user) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id);
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  redirect(
    parsed.data.next && parsed.data.next.startsWith("/admin")
      ? parsed.data.next
      : "/admin",
  );
}
