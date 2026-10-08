"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { PaymentIntentResult, VoterReceipt } from "../types";
import { PaymentReceiptCard } from "./PaymentReceiptCard";
import { formatPhp } from "../utils/pricing";

interface QrPhPaymentViewProps {
  intent: PaymentIntentResult;
  candidateName: string;
  candidateNumber: number;
  onBack?: (() => void) | undefined;
  onClose?: (() => void) | undefined;
  onSuccess?: ((receipt: VoterReceipt) => void) | undefined;
}

export function QrPhPaymentView({
  intent,
  candidateName,
  candidateNumber,
  onBack,
  onClose,
  onSuccess,
}: Readonly<QrPhPaymentViewProps>): React.JSX.Element {
  const queryClient = useQueryClient();
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<VoterReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);

  // Expiry Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check Status Handler
  const checkPaymentStatus = useCallback(
    async (simulate = false) => {
      if (receipt) return;
      if (simulate) setIsSimulating(true);
      else setIsVerifying(true);

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            referenceNumber: intent.referenceNumber,
            simulateSuccess: simulate,
          }),
        });

        const res = await response.json();
        const payload = (res.data ?? res) as {
          isPaid?: boolean;
          receipt?: VoterReceipt;
          error?: string;
        };

        if (res.success && payload.isPaid && payload.receipt) {
          setReceipt(payload.receipt);
          setIsPolling(false);

          // Invalidate all related TanStack Query caches so vote counts and leaderboards update in real-time
          queryClient.invalidateQueries({ queryKey: ["contestants"] });
          queryClient.invalidateQueries({ queryKey: ["event"] });
          queryClient.invalidateQueries({ queryKey: ["events"] });
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
          queryClient.invalidateQueries({ queryKey: ["voting-quota"] });

          if (onSuccess) onSuccess(payload.receipt);
        } else if (!res.success && (payload.error || res.error)) {
          setErrorMessage(payload.error ?? res.error);
        }
      } catch (err) {
        console.error("Payment check error:", err);
      } finally {
        setIsVerifying(false);
        setIsSimulating(false);
      }
    },
    [intent.referenceNumber, receipt, onSuccess, queryClient],
  );

  const handleMobileWalletHandoff = (wallet: "gcash" | "maya") => {
    const walletName = wallet === "gcash" ? "GCash" : "Maya";
    setHandoffMessage(
      `Redirecting to ${walletName}. Please confirm the payment in your app. Listening for payment confirmation...`,
    );

    if (intent.checkoutUrl) {
      window.open(intent.checkoutUrl, "_blank", "noopener,noreferrer");
    } else {
      const deepLink =
        wallet === "gcash"
          ? `gcash://pay?ref=${intent.referenceNumber}&amount=${intent.amountInPhp}`
          : `paymaya://pay?ref=${intent.referenceNumber}&amount=${intent.amountInPhp}`;
      window.open(deepLink, "_blank");
    }

    setTimeout(() => {
      checkPaymentStatus(false);
    }, 2000);
  };

  // Real-time Polling every 3.5 seconds
  useEffect(() => {
    if (!isPolling || receipt || timeLeftSeconds === 0) return;

    const pollInterval = setInterval(() => {
      checkPaymentStatus(false);
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [isPolling, receipt, timeLeftSeconds, checkPaymentStatus]);

  if (receipt) {
    return <PaymentReceiptCard receipt={receipt} onClose={onClose ?? onBack} />;
  }

  const isExpired = timeLeftSeconds === 0;

  return (
    <div className="flex flex-col gap-5 p-6 text-slate-900 dark:text-white">
      {/* Header with Back Button & Reference */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change Package</span>
          </button>
        ) : (
          <span className="font-mono text-xs font-bold text-slate-500">QR Ph Dynamic Rail</span>
        )}
        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
          Ref: {intent.referenceNumber}
        </span>
      </div>

      {/* Candidate and Order Summary */}
      <div className="flex items-center justify-between border border-sky-200 bg-sky-50/60 p-3.5 dark:border-sky-900/50 dark:bg-sky-950/30">
        <div>
          <span className="font-sans text-[11px] font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400">
            Casting Vote For
          </span>
          <p className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
            #{candidateNumber} {candidateName}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-base font-black text-sky-700 dark:text-sky-300">
            {formatPhp(intent.amountInPhp)}
          </p>
          <p className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            +{intent.totalVotes} Votes {intent.bonusVotes > 0 && `(+${intent.bonusVotes} bonus)`}
          </p>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
        {/* Countdown Timer */}
        <div className="mb-4 flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Clock
            className={`h-3.5 w-3.5 ${timeLeftSeconds < 120 ? "animate-pulse text-red-500" : "text-sky-600"}`}
          />
          <span>Expires in: {formatTimer(timeLeftSeconds)}</span>
        </div>

        {/* Dynamic QR Code Image */}
        {isExpired ? (
          <div className="flex h-56 w-56 flex-col items-center justify-center border border-dashed border-red-300 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950/30">
            <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
            <p className="font-heading text-sm font-bold text-red-700 dark:text-red-300">
              QR Code Expired
            </p>
            <p className="mt-1 font-sans text-xs text-red-600 dark:text-red-400">
              Please go back and generate a new payment session.
            </p>
          </div>
        ) : (
          <div className="relative flex h-60 w-60 items-center justify-center border-2 border-slate-900 bg-white p-2 dark:border-slate-200">
            {intent.qrCodeData ? (
              <Image
                src={intent.qrCodeData}
                alt="QR Ph Payment Code"
                width={224}
                height={224}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-slate-400">
                Loading QR Code...
              </div>
            )}
          </div>
        )}

        {/* Scan Instructions */}
        <p className="mt-4 text-center font-sans text-xs text-slate-600 dark:text-slate-400">
          Open <strong>GCash</strong>, <strong>Maya</strong>, <strong>BDO</strong>,{" "}
          <strong>BPI</strong>, or any <strong>BSP QR Ph</strong> banking app and scan this QR code.
        </p>

        {/* Partner Logos Pill */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[10px] font-bold text-slate-600 uppercase dark:text-slate-400">
          <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900">
            GCash
          </span>
          <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900">
            Maya
          </span>
          <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900">
            ShopeePay
          </span>
          <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900">
            QR Ph
          </span>
          <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 dark:border-slate-800 dark:bg-slate-900">
            All Banks
          </span>
        </div>

        {/* Mobile 1-Tap Wallet Handoff (US2/AC2) */}
        <div className="mt-4 flex w-full flex-col gap-2 border-t border-dashed border-slate-200 pt-3 dark:border-slate-800">
          <span className="font-heading text-center text-[10px] font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Mobile 1-Tap App Handoff
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleMobileWalletHandoff("gcash")}
              disabled={isExpired}
              className="font-heading flex items-center justify-center gap-1.5 border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-extrabold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Pay with GCash</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileWalletHandoff("maya")}
              disabled={isExpired}
              className="font-heading flex items-center justify-center gap-1.5 border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-extrabold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Pay with Maya</span>
            </button>
          </div>
          {handoffMessage && (
            <div className="mt-1 border border-sky-300 bg-sky-50 p-2 text-center font-sans text-xs text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
              {handoffMessage}
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Polling indicator & Manual check */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <RefreshCw className={`h-3.5 w-3.5 text-sky-600 ${isVerifying ? "animate-spin" : ""}`} />
          <span className="font-sans text-[11px]">Listening for live payment confirmation...</span>
        </div>
        <button
          type="button"
          onClick={() => checkPaymentStatus(false)}
          disabled={isVerifying || isExpired}
          className="font-mono text-xs font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 dark:text-sky-400"
        >
          {isVerifying ? "Checking..." : "I have paid"}
        </button>
      </div>

      {/* Local Dev / Sandbox Simulator Button */}
      <div className="border border-dashed border-amber-300 bg-amber-50/70 p-3 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-900 dark:text-amber-300">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span>Developer Sandbox Test</span>
          </div>
          <button
            type="button"
            onClick={() => checkPaymentStatus(true)}
            disabled={isSimulating || isExpired}
            className="font-heading flex items-center gap-1.5 border border-amber-600 bg-amber-600 px-3 py-1.5 text-xs font-extrabold tracking-wider text-white uppercase shadow-xs transition-all hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Zap className="h-3 w-3" />
            <span>{isSimulating ? "Simulating..." : "⚡ Simulate GCash/Maya Payment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
