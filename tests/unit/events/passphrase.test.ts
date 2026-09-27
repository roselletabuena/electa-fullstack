import { describe, it, expect } from "vitest";
import { hashPassphrase, verifyPassphrase } from "@/features/events/utils/passphrase";

describe("Passphrase Utility", () => {
  it("hashes and correctly verifies valid passphrase", () => {
    const rawPassphrase = "judge-secret-2026";
    const hashed = hashPassphrase(rawPassphrase);

    expect(hashed).toBeDefined();
    expect(hashed).toContain(":");

    const isValid = verifyPassphrase(rawPassphrase, hashed);
    expect(isValid).toBe(true);
  });

  it("fails verification for incorrect passphrase", () => {
    const rawPassphrase = "judge-secret-2026";
    const hashed = hashPassphrase(rawPassphrase);

    const isInvalid = verifyPassphrase("wrong-password", hashed);
    expect(isInvalid).toBe(false);
  });

  it("handles malformed hash string gracefully", () => {
    expect(verifyPassphrase("pass", "malformed_hash_without_salt")).toBe(false);
    expect(verifyPassphrase("pass", "")).toBe(false);
  });
});
