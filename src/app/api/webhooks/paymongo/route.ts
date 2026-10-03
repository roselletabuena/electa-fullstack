import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { env } from "@/env";

export function verifyPayMongoSignature(
  payload: string,
  signatureHeader: string | null,
  webhookSecret: string,
): boolean {
  if (!signatureHeader || !webhookSecret) return true; // Bypass in dev if secret not configured

  try {
    // Format: t=timestamp,te=test_signature,li=live_signature
    const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, curr) => {
      const [key, val] = curr.split("=");
      if (key && val) acc[key.trim()] = val.trim();
      return acc;
    }, {});

    const timestamp = parts.t;
    const signature = parts.li || parts.te;

    if (!timestamp || !signature) return false;

    const signaturePayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(signaturePayload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    console.error("Webhook signature verification error:", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("paymongo-signature");

    if (env.PAYMONGO_WEBHOOK_SECRET_KEY) {
      const isValid = verifyPayMongoSignature(
        rawBody,
        signatureHeader,
        env.PAYMONGO_WEBHOOK_SECRET_KEY,
      );
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.data?.attributes?.type;
    const resourceData = event.data?.attributes?.data;

    // Check if event relates to a payment or payment intent
    if (eventType === "payment.paid" || eventType === "payment_intent.succeeded") {
      const intentId = resourceData?.attributes?.payment_intent_id || resourceData?.id;
      const metadata = resourceData?.attributes?.metadata;
      const referenceNumber = metadata?.reference_number || metadata?.referenceNumber;

      if (!intentId && !referenceNumber) {
        return NextResponse.json({ received: true, note: "No transaction identifier" });
      }

      // Find the pending transaction
      const transaction = await db.paymentTransaction.findFirst({
        where: {
          OR: [
            ...(referenceNumber ? [{ referenceNumber }] : []),
            ...(intentId ? [{ paymongoPaymentIntentId: intentId }] : []),
          ],
        },
      });

      if (!transaction || transaction.status === "PAID") {
        return NextResponse.json({ received: true, note: "Already processed or not found" });
      }

      // Atomically update transaction and credit votes
      await db.$transaction(async (tx) => {
        const fresh = await tx.paymentTransaction.findUnique({
          where: { id: transaction.id },
          select: { status: true },
        });

        if (fresh?.status === "PAID") return;

        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        await tx.vote.create({
          data: {
            eventId: transaction.eventId,
            contestantId: transaction.contestantId,
            voterId: transaction.voterIdentifier,
            awardCategoryId: transaction.awardCategoryId,
            voteType: "BOOST",
            voteWeight: transaction.votesAwarded,
            paymentTransactionId: transaction.id,
          },
        });

        await tx.contestant.update({
          where: { id: transaction.contestantId },
          data: {
            voteCount: {
              increment: transaction.votesAwarded,
            },
          },
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayMongo Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handler failed" },
      { status: 500 },
    );
  }
}
