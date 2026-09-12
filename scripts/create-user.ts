/**
 * Cria (ou atualiza a senha de) um usuário do painel.
 *
 *   npm run user:create -- --email fernanda@avanca.com --name "Fernanda"
 *   npm run user:create -- --email rogerio@avanca.com --name "Rogério" --password "trocar123"
 *
 * Sem --password, uma senha forte é gerada e mostrada uma vez.
 */
import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name")?.trim();
  const role = arg("role")?.trim() || "equipe";
  if (!email || !name) {
    console.error('Uso: npm run user:create -- --email <email> --name "<nome>" [--password <senha>] [--role equipe|admin]');
    process.exit(1);
  }

  const password = arg("password") || randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(password);

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    await db
      .update(users)
      .set({ name, role, passwordHash, active: true, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`Usuário atualizado: ${email}`);
  } else {
    await db.insert(users).values({ email, name, role, passwordHash });
    console.log(`Usuário criado: ${email}`);
  }

  console.log("\n=== credenciais ===");
  console.log(`e-mail: ${email}`);
  console.log(`senha:  ${password}`);
  console.log("===================");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
