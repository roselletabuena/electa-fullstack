"use server";

import { db } from "@/lib/db";
import {
  verifyPaymentSchema,
  type VerifyPaymentInput,
  type VoterReceipt,
  type PaymentStatusType,
} from "../types";
import { getPayMongoPaymentIntent } from "../services/paymongo";

export interface VerifyPaymentResponse {
  success: boolean;
  isPaid: boolean;
  status: PaymentStatusType;
  receipt?: VoterReceipt;
  error?: string;
}

export async function verifyPaymentStatusAction(
  rawInput: VerifyPaymentInput,
  options?: { simulateSuccess?: boolean },
): Promise<VerifyPaymentResponse> {
  try {
    const { referenceNumber } = verifyPaymentSchema.parse(rawInput);

    // 1. Fetch transaction with relations
    const transaction = await db.paymentTransaction.findUnique({
      where: { referenceNumber },
      include: {
        event: { select: { id: true, title: true } },
        contestant: {
          select: {
            id: true,
            name: true,
            contestantNumber: true,
            avatarUrl: true,
            voteCount: true,
          },
        },
      },
    });

    if (!transaction) {
      return { success: false, isPaid: false, status: "FAILED", error: "Transaction not found." };
    }

    // If already marked as PAID
    if (transaction.status === "PAID") {
      const baseVotes = transaction.votesAwarded - transaction.bonusVotes;
      const receipt: VoterReceipt = {
        referenceNumber: transaction.referenceNumber,
        eventTitle: transaction.event.title,
        candidateName: transaction.contestant.name,
        candidateNumber: transaction.contestant.contestantNumber,
        candidateAvatarUrl: transaction.contestant.avatarUrl,
        amountPaid: Number(transaction.amountInPhp),
        votesAwarded: transaction.votesAwarded,
        baseVotes,
        bonusVotes: transaction.bonusVotes,
        paidAt: (transaction.paidAt ?? transaction.updatedAt).toISOString(),
        paymentChannel: transaction.paymentChannel,
        verificationHash: `VS-SIG-${Buffer.from(`${transaction.id}-${transaction.referenceNumber}`).toString("base64").slice(0, 16)}`,
      };

      return {
        success: true,
        isPaid: true,
        status: "PAID",
        receipt,
      };
    }

    // 2. Check live PayMongo status or Sandbox simulation
    let isNowPaid = false;
    let paidDate = new Date();

    if (options?.simulateSuccess) {
      isNowPaid = true;
    } else if (transaction.paymongoPaymentIntentId) {
      const paymongoStatus = await getPayMongoPaymentIntent(transaction.paymongoPaymentIntentId);
      if (paymongoStatus.isPaid) {
        isNowPaid = true;
        if (paymongoStatus.paidAt) {
          paidDate = paymongoStatus.paidAt;
        }
      }
    }

    // 3. Atomically credit votes if payment succeeded
    if (isNowPaid) {
      await db.$transaction(async (tx) => {
        // Double check inside transaction
        const fresh = await tx.paymentTransaction.findUnique({
          where: { id: transaction.id },
          select: { status: true },
        });

        if (fresh?.status === "PAID") return;

        // Mark as PAID
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "PAID",
            paidAt: paidDate,
          },
        });

        // Insert BOOST Vote record
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

        // Increment Contestant voteCount
        await tx.contestant.update({
          where: { id: transaction.contestantId },
          data: {
            voteCount: {
              increment: transaction.votesAwarded,
            },
          },
        });
      });

      const baseVotes = transaction.votesAwarded - transaction.bonusVotes;
      const receipt: VoterReceipt = {
        referenceNumber: transaction.referenceNumber,
        eventTitle: transaction.event.title,
        candidateName: transaction.contestant.name,
        candidateNumber: transaction.contestant.contestantNumber,
        candidateAvatarUrl: transaction.contestant.avatarUrl,
        amountPaid: Number(transaction.amountInPhp),
        votesAwarded: transaction.votesAwarded,
        baseVotes,
        bonusVotes: transaction.bonusVotes,
        paidAt: paidDate.toISOString(),
        paymentChannel: transaction.paymentChannel,
        verificationHash: `VS-SIG-${Buffer.from(`${transaction.id}-${transaction.referenceNumber}`).toString("base64").slice(0, 16)}`,
      };

      return {
        success: true,
        isPaid: true,
        status: "PAID",
        receipt,
      };
    }

    return {
      success: true,
      isPaid: false,
      status: transaction.status,
    };
  } catch (error) {
    console.error("Error in verifyPaymentStatusAction:", error);
    return {
      success: false,
      isPaid: false,
      status: "FAILED",
      error: error instanceof Error ? error.message : "Failed to verify payment status.",
    };
  }
}
