import { describe, expect, it } from "vitest";

import {
  computePassphraseDigest,
  signPreviewToken,
  verifyPreviewToken,
} from "@/features/events/utils/preview-token";

describe("Draft Preview Token Authentication", () => {
  const testSlug = "preview-draft-contest";

  it("successfully signs and verifies a valid preview token without digest requirement", () => {
    const { token, expiresAt } = signPreviewToken(testSlug);

    expect(token).toBeDefined();
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now());

    const isValid = verifyPreviewToken(token, testSlug);
    expect(isValid).toBe(true);
  });

  it("successfully signs and verifies preview token with matching passphrase digest", () => {
    const hashA = "$2b$10$e7K42jK8.N9D3p9e1xH3.OHK28z.1234567890abcdef";
    const digestA = computePassphraseDigest(hashA);
    expect(digestA).toBeTruthy();

    const { token } = signPreviewToken(testSlug, digestA);
    const isValid = verifyPreviewToken(token, testSlug, digestA);
    expect(isValid).toBe(true);
  });

  it("rejects preview token when passphrase has been rotated (digest mismatch)", () => {
    const hashA = "$2b$10$oldHashValueAlpha123";
    const hashB = "$2b$10$newHashValueBeta456";
    const digestA = computePassphraseDigest(hashA);
    const digestB = computePassphraseDigest(hashB);

    // Token was issued under Passphrase A
    const { token } = signPreviewToken(testSlug, digestA);

    // Event now has Passphrase B
    const isValid = verifyPreviewToken(token, testSlug, digestB);
    expect(isValid).toBe(false);
  });

  it("rejects preview token when passphrase has been removed/cleared (null expected digest)", () => {
    const hashA = "$2b$10$oldHashValueAlpha123";
    const digestA = computePassphraseDigest(hashA);

    const { token } = signPreviewToken(testSlug, digestA);

    // Passphrase cleared in database -> active digest is null
    const isValid = verifyPreviewToken(token, testSlug, null);
    expect(isValid).toBe(false);
  });

  it("rejects legacy token lacking digest when active passphrase digest is required", () => {
    // Token signed without digest
    const { token } = signPreviewToken(testSlug);

    const activeDigest = computePassphraseDigest("$2b$10$currentActiveHash");
    const isValid = verifyPreviewToken(token, testSlug, activeDigest);
    expect(isValid).toBe(false);
  });

  it("rejects preview token if slug does not match", () => {
    const { token } = signPreviewToken(testSlug);

    const isValid = verifyPreviewToken(token, "different-event-slug");
    expect(isValid).toBe(false);
  });

  it("rejects preview token if signature is tampered", () => {
    const { token } = signPreviewToken(testSlug);
    const [payload] = token.split(".");
    const tamperedToken = `${payload}.invalidSignatureValue123`;

    const isValid = verifyPreviewToken(tamperedToken, testSlug);
    expect(isValid).toBe(false);
  });

  it("rejects expired preview token", () => {
    // Generate token with negative TTL (already expired)
    const { token } = signPreviewToken(testSlug, -1000);

    const isValid = verifyPreviewToken(token, testSlug);
    expect(isValid).toBe(false);
  });

  it("handles null, undefined, and malformed tokens safely", () => {
    expect(verifyPreviewToken(null, testSlug)).toBe(false);
    expect(verifyPreviewToken(undefined, testSlug)).toBe(false);
    expect(verifyPreviewToken("", testSlug)).toBe(false);
    expect(verifyPreviewToken("not-a-valid-token", testSlug)).toBe(false);
  });
});
