import crypto from "node:crypto";
import { env } from "@/env";

export interface BallotSelectionSignatureItem {
  officeId: string;
  candidateId: string;
}

export interface GenerateBallotReceiptParams {
  eventId: string;
  selections: BallotSelectionSignatureItem[];
  nonce?: string;
  timestamp?: string | Date;
}

export interface GeneratedBallotReceipt {
  receiptHash: string;
  nonce: string;
  timestamp: string;
}

export interface VerifyBallotReceiptParams {
  receiptHash: string;
  eventId: string;
  nonce: string;
  timestamp: string | Date;
  selections: BallotSelectionSignatureItem[];
}

/**
 * Normalizes ballot selections into canonical sorted format:
 * Primary sort: officeId ascending
 * Secondary sort: candidateId ascending
 */
function canonicalizeSelections(selections: BallotSelectionSignatureItem[]): string {
  const sorted = [...selections].sort((a, b) => {
    const officeCmp = a.officeId.localeCompare(b.officeId);
    if (officeCmp !== 0) {
      return officeCmp;
    }
    return a.candidateId.localeCompare(b.candidateId);
  });

  return JSON.stringify(sorted);
}

/**
 * Formats a timestamp into an ISO-8601 string.
 */
function normalizeTimestamp(ts?: string | Date): string {
  if (!ts) {
    return new Date().toISOString();
  }
  if (typeof ts === "string") {
    return ts;
  }
  return ts.toISOString();
}

/**
 * Generates an irreversible cryptographic HMAC-SHA256 receipt for an official ballot submission.
 */
export function generateBallotReceiptHash(
  params: GenerateBallotReceiptParams,
  secretKey?: string,
): GeneratedBallotReceipt {
  const nonce = params.nonce ?? crypto.randomBytes(16).toString("hex");
  const timestamp = normalizeTimestamp(params.timestamp);
  const secret =
    secretKey ??
    env.AUTH_SECRET ??
    "electa_default_secret_ballot_pepper_key_32_bytes_long";

  const canonicalBody = canonicalizeSelections(params.selections);
  const payload = `${params.eventId}|${nonce}|${timestamp}|${canonicalBody}`;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const receiptHash = hmac.digest("hex");

  return {
    receiptHash,
    nonce,
    timestamp,
  };
}

/**
 * Verifies that a ballot receipt hash matches canonical parameters using constant-time comparison.
 */
export function verifyBallotReceiptHash(
  params: VerifyBallotReceiptParams,
  secretKey?: string,
): boolean {
  if (!params.receiptHash || params.receiptHash.length !== 64) {
    return false;
  }

  const generated = generateBallotReceiptHash(
    {
      eventId: params.eventId,
      selections: params.selections,
      nonce: params.nonce,
      timestamp: params.timestamp,
    },
    secretKey,
  );

  const expectedBuffer = Buffer.from(generated.receiptHash, "hex");
  const actualBuffer = Buffer.from(params.receiptHash, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Formats a 64-character hex receipt hash into an accessible, human-readable display token:
 * Example: `VOTE-ABCD-EF01-2345-6789`
 */
export function formatReceiptToken(receiptHash: string): string {
  const cleanHex = receiptHash.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
  const chunk1 = cleanHex.slice(0, 4);
  const chunk2 = cleanHex.slice(4, 8);
  const chunk3 = cleanHex.slice(8, 12);
  const chunk4 = cleanHex.slice(12, 16);

  return `VOTE-${chunk1}-${chunk2}-${chunk3}-${chunk4}`;
}
