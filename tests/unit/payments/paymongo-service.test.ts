import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPayMongoPaymentIntent,
  getPayMongoPaymentIntent,
  isPayMongoConfigured,
} from "@/features/payments/services/paymongo";

describe("Payments - PayMongo Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles mock sandbox mode when PayMongo is not configured or in test harness", async () => {
    // If not configured, should return mock intent without throwing
    const result = await createPayMongoPaymentIntent({
      amountInCents: 25000,
      description: "Test Boost",
      referenceNumber: "VS-TEST-MOCK-REF",
    });

    expect(result).toBeDefined();
    expect(result.amount).toBe(25000);
    expect(result.id).toBeDefined();
    expect(result.status).toBe("awaiting_payment_method");
  });

  it("retrieves status for mock intent smoothly", async () => {
    const status = await getPayMongoPaymentIntent("pi_mock_12345");
    expect(status.id).toBe("pi_mock_12345");
    expect(status.isPaid).toBe(false);
  });

  it("checks whether PayMongo is configured", () => {
    expect(typeof isPayMongoConfigured()).toBe("boolean");
  });
});
