"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ShieldCheck, ArrowRight } from "lucide-react";
import type { BallotSubmissionReceiptDto } from "../types/ballot";

export interface BallotReceiptCardProps {
  receipt: BallotSubmissionReceiptDto;
  eventSlug: string;
  eventTitle?: string | undefined;
}

export function BallotReceiptCard({
  receipt,
  eventSlug,
  eventTitle,
}: Readonly<BallotReceiptCardProps>): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receipt.ballotId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is not available
    }
  };

  const formattedDate = new Date(receipt.submittedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div
      role="region"
      aria-label="Ballot submission receipt"
      className="card-style w-full border border-slate-300 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-[#0d1424]"
    >
      {/* Header Badge */}
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex size-14 items-center justify-center border border-emerald-500/30 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <ShieldCheck className="size-3.5" />
          <span>Verified Official Ballot</span>
        </div>

        <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Ballot Recorded
        </h2>
        <p className="mt-1 font-sans text-sm text-slate-600 dark:text-slate-300">
          {eventTitle
            ? `Your votes for ${eventTitle} have been securely processed into the official audit ledger.`
            : "Your votes have been securely processed into the official audit ledger."}
        </p>
      </div>

      {/* Anonymous Token Display Section */}
      <div className="mt-6 border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <span className="block font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Anonymous Receipt Token
            </span>
            <code
              data-testid="receipt-token-value"
              className="mt-1 block font-mono text-xs font-bold text-slate-900 sm:text-sm dark:text-sky-400"
            >
              {receipt.ballotId}
            </code>
          </div>

          <button
            type="button"
            onClick={handleCopyReceipt}
            aria-label="Copy receipt ID to clipboard"
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-bold tracking-wider text-slate-800 uppercase shadow-xs transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy Receipt ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta Stats Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <span className="block font-sans text-xs text-slate-500 dark:text-slate-400">
            Votes Cast
          </span>
          <span className="mt-1 block font-mono text-xl font-bold text-slate-900 dark:text-white">
            {receipt.votesCount} {receipt.votesCount === 1 ? "Position" : "Positions"}
          </span>
        </div>

        <div className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <span className="block font-sans text-xs text-slate-500 dark:text-slate-400">
            Timestamp
          </span>
          <span className="mt-1 block font-mono text-xs font-bold text-slate-900 dark:text-slate-200">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Notice info */}
      <p className="mt-4 font-sans text-xs text-slate-500 dark:text-slate-400">
        In compliance with institutional election rules, voter identity is decoupled from ballot
        selections to guarantee secret-ballot privacy. Save your receipt token to verify your ballot
        inclusion in final tallies.
      </p>

      {/* Action Links */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/events/${eventSlug}`}
          className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-5 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <span>Return to Election Hub</span>
          <ArrowRight className="size-4" />
        </Link>

        <Link
          href={`/events/${eventSlug}/leaderboard`}
          className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest text-slate-800 uppercase shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <span>View Public Standings</span>
        </Link>
      </div>
    </div>
  );
}
