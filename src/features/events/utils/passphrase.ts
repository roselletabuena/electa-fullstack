import crypto from "node:crypto";

/**
 * Generates a salted scrypt hash for draft passphrases.
 */
export function hashPassphrase(passphrase: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(passphrase, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain text passphrase against the stored salt:hash string.
 */
export function verifyPassphrase(passphrase: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const key = crypto.scryptSync(passphrase, salt, 64);
    const keyBuffer = Buffer.from(hash, "hex");
    return crypto.timingSafeEqual(key, keyBuffer);
  } catch {
    return false;
  }
}
