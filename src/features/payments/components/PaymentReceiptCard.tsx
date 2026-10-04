"use client";

import React, { useState } from "react";
import { CheckCircle2, Copy, Check, Download } from "lucide-react";
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

  const handleDownloadProofPng = () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 600 * scale;
    canvas.height = 760 * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 600, 760);

    // Outer border
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 568, 728);

    // Top Header Banner
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(20, 20, 560, 80);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("VOTESPHERE OFFICIAL RECEIPT", 300, 55);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PHILIPPINE QR PH & PAYMENT RAILS VERIFIED", 300, 80);

    // Reference & Status
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(40, 120, 520, 60);
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 120, 520, 60);

    ctx.textAlign = "left";
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("TRANSACTION REFERENCE", 60, 145);
    ctx.fillText("STATUS", 420, 145);

    ctx.fillStyle = "#0284C7";
    ctx.font = "bold 14px monospace";
    ctx.fillText(receipt.referenceNumber, 60, 165);

    ctx.fillStyle = "#059669";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("PAID & CREDITED", 420, 165);

    // Receipt details list
    const details: Array<[string, string]> = [
      ["Event", receipt.eventTitle],
      ["Contestant", `#${receipt.candidateNumber} ${receipt.candidateName}`],
      [
        "Votes Credited",
        `+${receipt.votesAwarded} Votes (${receipt.baseVotes} base + ${receipt.bonusVotes} bonus)`,
      ],
      ["Amount Paid", formatPhp(receipt.amountPaid)],
      ["Payment Channel", receipt.paymentChannel],
      ["Timestamp", new Date(receipt.paidAt).toLocaleString("en-PH")],
    ];

    let startY = 220;
    for (const [idx, [label, value]] of details.entries()) {
      ctx.fillStyle = idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      ctx.fillRect(40, startY - 18, 520, 36);

      ctx.fillStyle = "#64748B";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, 60, startY + 5);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(value, 540, startY + 5);

      startY += 40;
    }

    // Security Hash Footer
    ctx.fillStyle = "#F1F5F9";
    ctx.fillRect(40, startY + 20, 520, 70);
    ctx.strokeStyle = "#CBD5E1";
    ctx.strokeRect(40, startY + 20, 520, 70);

    ctx.textAlign = "left";
    ctx.fillStyle = "#64748B";
    ctx.font = "10px monospace";
    ctx.fillText("CRYPTOGRAPHIC AUDIT VERIFICATION HASH", 60, startY + 45);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12px monospace";
    ctx.fillText(receipt.verificationHash, 60, startY + 68);

    // Footer Watermark
    ctx.fillStyle = "#94A3B8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Electa Monetization Engine · BSP-Compliant Rail Proof", 300, 720);

    // Trigger download
    const link = document.createElement("a");
    link.download = `VoteSphere-Receipt-${receipt.referenceNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900 dark:text-white">
      {/* Refined Header */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-none border border-emerald-500/30 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase dark:text-emerald-400">
          Payment Verified
        </span>
        <h2 className="font-heading mt-1 text-xl font-black tracking-tight uppercase">
          Vote Boost Confirmed
        </h2>
        <p className="mt-0.5 font-sans text-xs text-slate-500 dark:text-slate-400">
          Empowering candidate in {receipt.eventTitle}
        </p>
      </div>

      {/* Unified Digital Receipt Voucher */}
      <div className="border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        {/* Highlight Hero: Votes Awarded */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="font-sans text-[11px] font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Total Impact
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                +{receipt.votesAwarded}
              </span>
              <span className="font-sans text-xs font-semibold text-slate-600 dark:text-slate-300">
                Official Votes
              </span>
            </div>
          </div>
          {receipt.bonusVotes > 0 && (
            <div className="border border-amber-300 bg-amber-50 px-2 py-1 text-right dark:border-amber-900/50 dark:bg-amber-950/30">
              <span className="font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                +{receipt.bonusVotes} Bonus Votes
              </span>
            </div>
          )}
        </div>

        {/* Clean Spec Rows */}
        <div className="divide-y divide-dashed divide-slate-200 py-1 dark:divide-slate-800">
          <div className="flex items-center justify-between py-2.5">
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400">Contestant</span>
            <span className="font-heading text-xs font-extrabold text-slate-900 dark:text-white">
              #{receipt.candidateNumber} {receipt.candidateName}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Amount Paid
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {formatPhp(receipt.amountPaid)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Receipt Ref
            </span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="flex items-center gap-1.5 font-mono text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              title="Click to copy reference"
            >
              <span>{receipt.referenceNumber}</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Payment Rail
            </span>
            <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300">
              {receipt.paymentChannel}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="font-sans text-xs text-slate-500 dark:text-slate-400">Timestamp</span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {new Date(receipt.paidAt).toLocaleString("en-PH")}
            </span>
          </div>
        </div>

        {/* Cryptographic Seal */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] dark:border-slate-800">
          <span className="font-mono tracking-wider text-slate-600 uppercase dark:text-slate-400">
            Audit Hash
          </span>
          <span className="font-mono font-medium text-slate-600 dark:text-slate-400">
            {receipt.verificationHash}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDownloadProofPng}
          className="font-heading flex h-11 w-full items-center justify-center gap-2 border border-sky-600 bg-sky-600 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-all hover:bg-sky-500 active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          <span>Download Receipt</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="font-heading flex h-10 w-full items-center justify-center border border-slate-300 bg-white text-xs font-bold tracking-wider text-slate-700 uppercase transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Done & Return to Event
          </button>
        )}
      </div>
    </div>
  );
}
