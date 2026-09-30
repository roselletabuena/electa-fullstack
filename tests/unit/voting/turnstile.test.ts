import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTurnstileToken } from "@/features/voting/utils/turnstile";

describe("Cloudflare Turnstile Verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts valid dev mock tokens without external HTTP calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await verifyTurnstileToken("mock-turnstile-token", "127.0.0.1");
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects empty or whitespace tokens immediately", async () => {
    const result1 = await verifyTurnstileToken("", "127.0.0.1");
    expect(result1.success).toBe(false);
    expect(result1.error).toBe("BOT_DETECTION_FAILED");

    const result2 = await verifyTurnstileToken("   ", "127.0.0.1");
    expect(result2.success).toBe(false);
    expect(result2.error).toBe("BOT_DETECTION_FAILED");
  });

  it("verifies live tokens via Cloudflare siteverify endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        challenge_ts: new Date().toISOString(),
        hostname: "electa.ph",
        "error-codes": [],
      }),
    } as unknown as Response);

    const result = await verifyTurnstileToken("valid-turnstile-token-from-client", "203.0.113.195");
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it("rejects when Cloudflare siteverify returns failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response", "timeout-or-duplicate"],
      }),
    } as unknown as Response);

    const result = await verifyTurnstileToken("invalid-expired-token", "203.0.113.195");
    expect(result.success).toBe(false);
    expect(result.error).toBe("BOT_DETECTION_FAILED");
  });

  it("handles fetch network failure gracefully and fails closed", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

    const result = await verifyTurnstileToken("token-during-cf-outage", "203.0.113.195");
    expect(result.success).toBe(false);
    expect(result.error).toBe("BOT_DETECTION_FAILED");
  });
});
