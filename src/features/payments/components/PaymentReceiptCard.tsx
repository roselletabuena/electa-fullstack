"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, Check, Sparkles } from "lucide-react";
import type { VoterReceipt } from "../types";
import { formatPhp } from "../utils/pricing";

interface PaymentReceiptCardProps {
  receipt: VoterReceipt;
  onClose?: (() => void) | undefined;
}

export function PaymentReceiptCard({
  receipt,
  onClose,
}: PaymentReceiptCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(receipt.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 text-slate-900 dark:text-white">
      {/* Header Banner */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center border-2 border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-emerald-800 uppercase dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          <span>Payment Verified & Votes Credited</span>
        </div>
        <h2 className="font-heading mt-2 text-2xl font-black tracking-tight uppercase">
          Vote Boost Confirmed!
        </h2>
        <p className="mt-1 font-sans text-xs text-slate-600 dark:text-slate-400">
          Thank you for empowering your candidate in {receipt.eventTitle}
        </p>
      </div>

      {/* Main Receipt Box */}
      <div className="border border-slate-300 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <span className="font-sans text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
            Official Receipt Ref
          </span>
          <button
            type="button"
            onClick={handleCopyRef}
            className="flex items-center gap-1 font-mono text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <span>{receipt.referenceNumber}</span>
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        {/* Candidate Row */}
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-2 dark:border-slate-800">
          <span className="font-sans text-xs text-slate-600 dark:text-slate-400">Contestant</span>
          <span className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
            #{receipt.candidateNumber} {receipt.candidateName}
          </span>
        </div>

        {/* Total Votes Row */}
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-2 dark:border-slate-800">
          <span className="font-sans text-xs text-slate-600 dark:text-slate-400">
            Votes Credited
          </span>
          <div className="text-right">
            <span className="font-mono text-base font-black text-sky-600 dark:text-sky-400">
              +{receipt.votesAwarded} Votes
            </span>
            {receipt.bonusVotes > 0 && (
              <span className="ml-1.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                (incl. {receipt.bonusVotes} bonus)
              </span>
            )}
          </div>
        </div>

        {/* Amount Paid Row */}
        <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-2 dark:border-slate-800">
          <span className="font-sans text-xs text-slate-600 dark:text-slate-400">Amount Paid</span>
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
            {formatPhp(receipt.amountPaid)}
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-sans text-xs text-slate-600 dark:text-slate-400">Timestamp</span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {new Date(receipt.paidAt).toLocaleString("en-PH")}
          </span>
        </div>
      </div>

      {/* Verification Hash Badge */}
      <div className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2 text-[11px] dark:border-slate-800 dark:bg-slate-950">
        <span className="font-mono text-slate-500">Security Hash</span>
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {receipt.verificationHash}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="font-heading flex h-11 w-full items-center justify-center border border-slate-900 bg-slate-900 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-all hover:bg-slate-800 active:scale-[0.99] dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Done & Return to Event
          </button>
        )}
      </div>
    </div>
  );
}
