import { describe, it, expect } from "vitest";
import {
  generateBallotReceiptHash,
  verifyBallotReceiptHash,
  formatReceiptToken,
} from "@/lib/crypto/ballot-receipt";

describe("Cryptographic Ballot Receipt Generator & Verifier", () => {
  const secretKey = "test-secret-salt-key-for-ballots";
  const eventId = "election-event-2026-uuid";
  const selections = [
    { officeId: "pres-office", candidateId: "cand-alice" },
    { officeId: "vp-office", candidateId: "cand-bob" },
  ];

  it("generates a deterministic HMAC receipt hash for fixed inputs and nonce", () => {
    const fixedNonce = "nonce-fixed-123456";
    const fixedTimestamp = "2026-10-14T10:00:00.000Z";

    const receipt1 = generateBallotReceiptHash(
      {
        eventId,
        selections,
        nonce: fixedNonce,
        timestamp: fixedTimestamp,
      },
      secretKey,
    );

    const receipt2 = generateBallotReceiptHash(
      {
        eventId,
        selections,
        nonce: fixedNonce,
        timestamp: fixedTimestamp,
      },
      secretKey,
    );

    expect(receipt1.receiptHash).toBe(receipt2.receiptHash);
    expect(receipt1.nonce).toBe(fixedNonce);
    expect(receipt1.timestamp).toBe(fixedTimestamp);
    expect(receipt1.receiptHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes selection order so permutations produce identical receipt hashes", () => {
    const fixedNonce = "nonce-fixed-123456";
    const fixedTimestamp = "2026-10-14T10:00:00.000Z";

    const orderedReceipt = generateBallotReceiptHash(
      {
        eventId,
        selections: [
          { officeId: "pres-office", candidateId: "cand-alice" },
          { officeId: "vp-office", candidateId: "cand-bob" },
        ],
        nonce: fixedNonce,
        timestamp: fixedTimestamp,
      },
      secretKey,
    );

    const reversedReceipt = generateBallotReceiptHash(
      {
        eventId,
        selections: [
          { officeId: "vp-office", candidateId: "cand-bob" },
          { officeId: "pres-office", candidateId: "cand-alice" },
        ],
        nonce: fixedNonce,
        timestamp: fixedTimestamp,
      },
      secretKey,
    );

    expect(orderedReceipt.receiptHash).toBe(reversedReceipt.receiptHash);
  });

  it("verifies valid ballot receipt hashes successfully", () => {
    const receipt = generateBallotReceiptHash(
      {
        eventId,
        selections,
      },
      secretKey,
    );

    const isValid = verifyBallotReceiptHash(
      {
        receiptHash: receipt.receiptHash,
        eventId,
        nonce: receipt.nonce,
        timestamp: receipt.timestamp,
        selections,
      },
      secretKey,
    );

    expect(isValid).toBe(true);
  });

  it("rejects tampered candidate selections during verification", () => {
    const receipt = generateBallotReceiptHash(
      {
        eventId,
        selections,
      },
      secretKey,
    );

    const tamperedSelections = [
      { officeId: "pres-office", candidateId: "cand-eve-fraud" },
      { officeId: "vp-office", candidateId: "cand-bob" },
    ];

    const isValid = verifyBallotReceiptHash(
      {
        receiptHash: receipt.receiptHash,
        eventId,
        nonce: receipt.nonce,
        timestamp: receipt.timestamp,
        selections: tamperedSelections,
      },
      secretKey,
    );

    expect(isValid).toBe(false);
  });

  it("rejects incorrect or modified receipt hashes", () => {
    const receipt = generateBallotReceiptHash(
      {
        eventId,
        selections,
      },
      secretKey,
    );

    const modifiedHash = "a".repeat(64);

    const isValid = verifyBallotReceiptHash(
      {
        receiptHash: modifiedHash,
        eventId,
        nonce: receipt.nonce,
        timestamp: receipt.timestamp,
        selections,
      },
      secretKey,
    );

    expect(isValid).toBe(false);
  });

  it("formats receipt hashes into human-readable segmented tokens", () => {
    const rawHash = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
    const formatted = formatReceiptToken(rawHash);

    expect(formatted.startsWith("VOTE-")).toBe(true);
    expect(formatted).toBe("VOTE-ABCD-EF01-2345-6789");
  });
});
