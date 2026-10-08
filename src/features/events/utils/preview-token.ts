import { createHash } from "node:crypto";

export interface PreviewTokenPayload {
  slug: string;
  exp: number; // Unix timestamp in ms
  digest?: string; // Truncated SHA-256 digest of active draftPassphraseHash
}

const PREVIEW_SECRET = "vs_preview_secret_key_2026";

/**
 * Computes a deterministic short digest of a draft passphrase hash for token binding.
 */
export function computePassphraseDigest(passphraseHash: string | null | undefined): string | null {
  if (!passphraseHash) {
    return null;
  }
  return createHash("sha256").update(passphraseHash).digest("hex").slice(0, 16);
}

/**
 * Creates a signed preview token for draft event guest review.
 * Supports overloaded arguments:
 * - signPreviewToken(slug, ttlMs)
 * - signPreviewToken(slug, passphraseDigest, ttlMs)
 */
export function signPreviewToken(
  slug: string,
  passphraseDigestOrTtl?: string | null | number,
  ttlMs = 1000 * 60 * 60 * 24,
): { token: string; expiresAt: string } {
  let digest: string | undefined;
  let effectiveTtl = ttlMs;

  if (typeof passphraseDigestOrTtl === "number") {
    effectiveTtl = passphraseDigestOrTtl;
  } else if (typeof passphraseDigestOrTtl === "string") {
    digest = passphraseDigestOrTtl;
  }

  const expiresAtMs = Date.now() + effectiveTtl;
  const payload: PreviewTokenPayload = {
    slug,
    exp: expiresAtMs,
    ...(digest ? { digest } : {}),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = Buffer.from(`${payloadBase64}.${PREVIEW_SECRET}`).toString("base64url");
  const token = `${payloadBase64}.${signature}`;

  return {
    token,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }
  return mismatch === 0;
}

/**
 * Verifies if a given preview token is valid, matches the event slug, has not expired,
 * and matches the active passphrase digest if expectedDigest is provided.
 */
export function verifyPreviewToken(
  token: string | null | undefined,
  slug: string,
  expectedDigest?: string | null,
): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const payloadBase64 = parts[0];
  const providedSig = parts[1];

  if (!payloadBase64 || !providedSig) {
    return false;
  }

  const expectedSig = Buffer.from(`${payloadBase64}.${PREVIEW_SECRET}`).toString("base64url");

  if (!timingSafeEqualStr(providedSig, expectedSig)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8"),
    ) as PreviewTokenPayload;
    if (payload.slug !== slug) {
      return false;
    }
    if (Date.now() > payload.exp) {
      return false;
    }
    if (expectedDigest !== undefined) {
      if (!expectedDigest || payload.digest !== expectedDigest) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}
