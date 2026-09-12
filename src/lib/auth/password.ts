import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Hash de senha com scrypt (nativo do Node, sem dependência externa).
 * Formato guardado em users.password_hash:  scrypt$<saltHex>$<hashHex>
 */
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;
const SALT_BYTES = 16;

// Pepper opcional (AUTH_PEPPER no .env) — some defesa a mais se o banco vazar.
const pepper = process.env.AUTH_PEPPER ?? "";

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(plain + pepper, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "hex");
  const expected = Buffer.from(parts[2]!, "hex");
  const derived = await scrypt(plain + pepper, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
