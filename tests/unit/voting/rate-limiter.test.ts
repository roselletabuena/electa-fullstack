import { describe, it, expect, beforeEach } from "vitest";
import {
  checkIpVelocity,
  checkDeviceAccountLimit,
  resetRateLimiterStores,
} from "@/features/voting/utils/rate-limiter";

describe("Anti-Fraud Rate Limiter & Velocity Engine", () => {
  beforeEach(() => {
    resetRateLimiterStores();
  });

  describe("IP Velocity Rate Limiting", () => {
    it("allows requests below the velocity threshold (10 req/min)", () => {
      const ip = "198.51.100.42";
      for (let i = 0; i < 10; i++) {
        const result = checkIpVelocity(ip);
        expect(result.allowed).toBe(true);
        expect(result.error).toBeNull();
      }
    });

    it("throttles requests when velocity exceeds 10 req/min", () => {
      const ip = "198.51.100.42";
      for (let i = 0; i < 10; i++) {
        checkIpVelocity(ip);
      }

      const throttledResult = checkIpVelocity(ip);
      expect(throttledResult.allowed).toBe(false);
      expect(throttledResult.error).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("tracks different IP addresses independently", () => {
      const ip1 = "198.51.100.1";
      const ip2 = "198.51.100.2";

      for (let i = 0; i < 10; i++) {
        checkIpVelocity(ip1);
      }

      expect(checkIpVelocity(ip1).allowed).toBe(false);
      expect(checkIpVelocity(ip2).allowed).toBe(true);
    });
  });

  describe("Device Account Threshold (Anti-Syndicate)", () => {
    const eventId = "event-test-uuid";
    const deviceId = "device-fingerprint-hash-xyz";

    it("permits up to 3 distinct voter accounts from the same device in 24 hours", () => {
      expect(checkDeviceAccountLimit(deviceId, eventId, "voter-001").allowed).toBe(true);
      expect(checkDeviceAccountLimit(deviceId, eventId, "voter-002").allowed).toBe(true);
      expect(checkDeviceAccountLimit(deviceId, eventId, "voter-003").allowed).toBe(true);
    });

    it("allows the same registered account to submit again from the same device", () => {
      checkDeviceAccountLimit(deviceId, eventId, "voter-001");
      checkDeviceAccountLimit(deviceId, eventId, "voter-002");
      checkDeviceAccountLimit(deviceId, eventId, "voter-003");

      // voter-001 repeats: should still be allowed
      const repeatResult = checkDeviceAccountLimit(deviceId, eventId, "voter-001");
      expect(repeatResult.allowed).toBe(true);
    });

    it("rejects a 4th distinct voter account from the same device", () => {
      checkDeviceAccountLimit(deviceId, eventId, "voter-001");
      checkDeviceAccountLimit(deviceId, eventId, "voter-002");
      checkDeviceAccountLimit(deviceId, eventId, "voter-003");

      const blockedResult = checkDeviceAccountLimit(deviceId, eventId, "voter-004-syndicate");
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.error).toBe("DEVICE_ACCOUNT_LIMIT_EXCEEDED");
    });
  });
});
