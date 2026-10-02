"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Zap,
  X,
  ShieldCheck,
  Sparkles,
  QrCode,
  CreditCard,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { PRICING_TIERS, calculateCustomVotePackage, formatPhp } from "../utils/pricing";
import type { PaymentIntentResult, PaymentChannelType, VoterReceipt } from "../types";
import { QrPhPaymentView } from "./QrPhPaymentView";

interface BoostVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  contestantId: string;
  contestantName: string;
  contestantNumber: number;
  contestantAvatarUrl?: string | null | undefined;
  awardCategoryId?: string | null | undefined;
  voterIdentifier?: string | undefined;
  onSuccess?: ((receipt: VoterReceipt) => void) | undefined;
}

export function BoostVoteModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  contestantId,
  contestantName,
  contestantNumber,
  contestantAvatarUrl,
  awardCategoryId,
  voterIdentifier = "voter_anon_session",
  onSuccess,
}: BoostVoteModalProps): React.JSX.Element | null {
  const [selectedTierId, setSelectedTierId] = useState<string>("tier_popular");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customVotes, setCustomVotes] = useState<number>(50);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannelType>("QR_PH");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIntent, setActiveIntent] = useState<PaymentIntentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected details
  const selectedTier = PRICING_TIERS.find((t) => t.id === selectedTierId) ?? PRICING_TIERS[1]!;
  const customPkg = calculateCustomVotePackage(customVotes);

  const activePricePhp = isCustomMode ? customPkg.pricePhp : selectedTier.pricePhp;
  const activeTotalVotes = isCustomMode ? customPkg.totalVotes : selectedTier.totalVotes;

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/payments/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          contestantId,
          awardCategoryId,
          voterIdentifier,
          tierId: isCustomMode ? undefined : selectedTierId,
          customVotes: isCustomMode ? customVotes : undefined,
          paymentChannel,
        }),
      });

      const res = await response.json();

      if (res.success && res.data) {
        setActiveIntent(res.data);
      } else {
        setErrorMessage(res.error ?? "Could not initiate payment session.");
      }
    } catch (err) {
      console.error("Checkout intent error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boost-modal-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-xs duration-150 sm:p-4"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2
                id="boost-modal-title"
                className="font-heading text-sm font-black tracking-wider text-slate-900 uppercase dark:text-white"
              >
                Power Boost Votes
              </h2>
              <p className="font-sans text-[11px] text-slate-600 dark:text-slate-400">
                Philippine QR Ph & E-Wallets Rail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto">
          {activeIntent ? (
            <QrPhPaymentView
              intent={activeIntent}
              candidateName={contestantName}
              candidateNumber={contestantNumber}
              onBack={() => setActiveIntent(null)}
              onClose={() => {
                setActiveIntent(null);
                onClose();
              }}
              onSuccess={onSuccess}
            />
          ) : (
            <div className="flex flex-col gap-5 p-5">
              {/* Contestant Highlight Bar */}
              <div className="flex items-center gap-3 border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                {contestantAvatarUrl ? (
                  <Image
                    src={contestantAvatarUrl}
                    alt={contestantName}
                    width={48}
                    height={48}
                    className="h-12 w-12 border border-slate-300 object-cover dark:border-slate-700"
                  />
                ) : (
                  <div className="font-heading flex h-12 w-12 items-center justify-center border border-slate-300 bg-slate-200 text-sm font-extrabold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    #{contestantNumber}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-sky-600 uppercase dark:text-sky-400">
                    Candidate #{contestantNumber}
                  </span>
                  <h3 className="font-heading truncate text-base font-extrabold text-slate-900 dark:text-white">
                    {contestantName}
                  </h3>
                  <p className="truncate font-sans text-xs text-slate-600 dark:text-slate-400">
                    {eventTitle}
                  </p>
                </div>
              </div>

              {/* Mode Switch: Presets vs Custom Slider */}
              <div className="flex border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`font-heading flex-1 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    !isCustomMode
                      ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Featured Packages
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`font-heading flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    isCustomMode
                      ? "border border-slate-900 bg-slate-900 text-white shadow-xs dark:border-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Sliders className="h-3 w-3" />
                  <span>Custom Vote Slider</span>
                </button>
              </div>

              {/* Tier Cards Grid or Slider */}
              {!isCustomMode ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRICING_TIERS.map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`relative flex flex-col border p-3 text-left transition-all ${
                          isSelected
                            ? "border-2 border-sky-600 bg-sky-50/50 shadow-xs dark:border-sky-500 dark:bg-sky-950/30"
                            : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                        }`}
                      >
                        {tier.badge && (
                          <span
                            className={`mb-1.5 self-start px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider uppercase ${
                              tier.isPopular
                                ? "bg-amber-500 text-slate-950"
                                : tier.bonusVotes > 0
                                  ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                                  : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {tier.badge}
                          </span>
                        )}
                        <span className="font-heading text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatPhp(tier.pricePhp)}
                        </span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                            {tier.totalVotes}
                          </span>
                          <span className="font-sans text-[11px] text-slate-500">Votes</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4 border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-extrabold text-slate-700 uppercase dark:text-slate-300">
                      Choose Vote Quantity
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xl font-black text-sky-600 dark:text-sky-400">
                        {customPkg.totalVotes}
                      </span>
                      <span className="font-sans text-xs font-bold text-slate-600 dark:text-slate-400">
                        Votes Total
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={customVotes}
                    onChange={(e) => setCustomVotes(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-sky-600"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Base: {customPkg.baseVotes} votes</span>
                    {customPkg.bonusVotes > 0 && (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{customPkg.bonusVotes} Bonus Votes (+{customPkg.bonusPercentage}%)
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatPhp(customPkg.pricePhp)}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Channel Selector */}
              <div className="flex flex-col gap-2">
                <span className="font-heading text-[11px] font-extrabold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Select Payment Method
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChannel("QR_PH")}
                    className={`flex items-center gap-2.5 border p-3 text-left transition-all ${
                      paymentChannel === "QR_PH"
                        ? "border-sky-600 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/30"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <p className="font-heading text-xs font-bold text-slate-900 dark:text-white">
                        QR Ph / GCash / Maya
                      </p>
                      <p className="font-sans text-[10px] text-slate-500">
                        Scan via any PH banking app
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChannel("CARD")}
                    className={`flex items-center gap-2.5 border p-3 text-left transition-all ${
                      paymentChannel === "CARD"
                        ? "border-sky-600 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/30"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div>
                      <p className="font-heading text-xs font-bold text-slate-900 dark:text-white">
                        Credit / Debit Card
                      </p>
                      <p className="font-sans text-[10px] text-slate-500">Visa, Mastercard, JCB</p>
                    </div>
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="border border-red-300 bg-red-50 p-3 font-sans text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Order Summary & Submit Action */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                <div>
                  <span className="font-sans text-[10px] tracking-wider text-slate-500 uppercase">
                    Total Amount
                  </span>
                  <p className="font-mono text-xl font-black text-slate-900 dark:text-white">
                    {formatPhp(activePricePhp)}
                  </p>
                  <p className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{activeTotalVotes} Votes for #{contestantNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="font-heading flex h-11 items-center gap-2 border border-sky-600 bg-sky-600 px-6 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isLoading ? "Generating QR..." : "Proceed to Checkout"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Payment Rails · Bangko Sentral ng Pilipinas Compliant</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
