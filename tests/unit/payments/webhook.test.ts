import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyPayMongoSignature, POST } from "@/app/api/webhooks/paymongo/route";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => {
  const mockDb = {
    paymentTransaction: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vote: {
      create: vi.fn(),
    },
    contestant: {
      update: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
      return cb(mockDb);
    }),
  };
  return { db: mockDb };
});

describe("Payments - PayMongo Webhook Handler", () => {
  const secretKey = "whsec_test_secret_key_12345";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HMAC Signature Verification", () => {
    it("validates authentic signature accurately", () => {
      const payload = JSON.stringify({ data: { id: "evt_123" } });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signaturePayload = `${timestamp}.${payload}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(signaturePayload)
        .digest("hex");

      const header = `t=${timestamp},te=${signature}`;
      const result = verifyPayMongoSignature(payload, header, secretKey);

      expect(result).toBe(true);
    });

    it("rejects tampered payload or altered signature", () => {
      const payload = JSON.stringify({ data: { id: "evt_123" } });
      const tamperedPayload = JSON.stringify({ data: { id: "evt_hacked" } });
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signaturePayload = `${timestamp}.${payload}`;
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(signaturePayload)
        .digest("hex");

      const header = `t=${timestamp},te=${signature}`;
      const result = verifyPayMongoSignature(tamperedPayload, header, secretKey);

      expect(result).toBe(false);
    });

    it("rejects malformed header without timestamp or signature", () => {
      const payload = "{}";
      expect(verifyPayMongoSignature(payload, "invalid_header", secretKey)).toBe(false);
      expect(verifyPayMongoSignature(payload, "t=12345", secretKey)).toBe(false);
      expect(verifyPayMongoSignature(payload, "te=abcdef", secretKey)).toBe(false);
    });
  });

  describe("POST route handler - Atomic Vote Crediting & Idempotency", () => {
    it("atomically credits votes on first payment.paid webhook event", async () => {
      const mockTx = {
        id: "tx_001",
        referenceNumber: "VS-TEST-123",
        eventId: "event_1",
        contestantId: "contestant_1",
        awardCategoryId: null,
        voterIdentifier: "voter_anon_1",
        votesAwarded: 26,
        status: "PENDING",
      };

      vi.mocked(db.paymentTransaction.findFirst).mockResolvedValueOnce(mockTx as never);
      vi.mocked(db.paymentTransaction.findUnique).mockResolvedValueOnce({
        status: "PENDING",
      } as never);
      vi.mocked(db.paymentTransaction.update).mockResolvedValueOnce({
        ...mockTx,
        status: "PAID",
      } as never);
      vi.mocked(db.vote.create).mockResolvedValueOnce({ id: "vote_1" } as never);
      vi.mocked(db.contestant.update).mockResolvedValueOnce({
        id: "contestant_1",
        voteCount: 26,
      } as never);

      const webhookBody = JSON.stringify({
        data: {
          attributes: {
            type: "payment.paid",
            data: {
              id: "pay_test_123",
              attributes: {
                payment_intent_id: "pi_test_123",
                metadata: {
                  reference_number: "VS-TEST-123",
                },
              },
            },
          },
        },
      });

      const req = new NextRequest("http://localhost:3000/api/webhooks/paymongo", {
        method: "POST",
        body: webhookBody,
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.received).toBe(true);

      // Verify atomic database updates
      expect(db.paymentTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "tx_001" },
          data: expect.objectContaining({ status: "PAID" }),
        }),
      );

      expect(db.vote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: "event_1",
            contestantId: "contestant_1",
            voteType: "BOOST",
            voteWeight: 26,
            paymentTransactionId: "tx_001",
          }),
        }),
      );

      expect(db.contestant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "contestant_1" },
          data: { voteCount: { increment: 26 } },
        }),
      );
    });

    it("guarantees idempotency: ignores duplicate webhook when transaction is already PAID", async () => {
      const alreadyPaidTx = {
        id: "tx_001",
        referenceNumber: "VS-TEST-123",
        eventId: "event_1",
        contestantId: "contestant_1",
        status: "PAID",
      };

      vi.mocked(db.paymentTransaction.findFirst).mockResolvedValueOnce(alreadyPaidTx as never);

      const webhookBody = JSON.stringify({
        data: {
          attributes: {
            type: "payment.paid",
            data: {
              id: "pay_test_duplicate",
              attributes: {
                payment_intent_id: "pi_test_123",
                metadata: {
                  referenceNumber: "VS-TEST-123",
                },
              },
            },
          },
        },
      });

      const req = new NextRequest("http://localhost:3000/api/webhooks/paymongo", {
        method: "POST",
        body: webhookBody,
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.received).toBe(true);
      expect(json.note).toBe("Already processed or not found");

      // Verify no duplicate votes created or voteCount incremented
      expect(db.paymentTransaction.update).not.toHaveBeenCalled();
      expect(db.vote.create).not.toHaveBeenCalled();
      expect(db.contestant.update).not.toHaveBeenCalled();
    });
  });
});
