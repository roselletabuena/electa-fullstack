import { createHmac } from "node:crypto";
import { env } from "@/env";

const DEFAULT_SALT = env.AUTH_SECRET || "electa_voter_privacy_salt_2026";

/**
 * Generates a salted SHA-256 HMAC hash of an IP address to preserve auditability
 * while preventing reverse lookup of voters' physical locations (RA 10173 compliance).
 */
export function hashVoterIp(ip: string | null | undefined, customSalt?: string): string {
  if (!ip || ip.trim() === "") {
    return "anonymous_ip";
  }
  const cleanIp = ip.trim().toLowerCase();
  const salt = customSalt || DEFAULT_SALT;
  return createHmac("sha256", salt).update(cleanIp).digest("hex");
}

/**
 * Masks a voter identifier or session ID to prevent PII exposure in public or export logs.
 * Example: "usr_voter_123456789" -> "vot_***6789"
 * Example: "short" -> "vot_***ort"
 */
export function maskVoterIdentifier(voterId: string | null | undefined): string {
  if (!voterId || voterId.trim() === "") {
    return "vot_***anonymous";
  }
  const cleanId = voterId.trim();
  if (cleanId.length <= 4) {
    return `vot_***${cleanId}`;
  }
  const suffix = cleanId.slice(-4);
  return `vot_***${suffix}`;
}
