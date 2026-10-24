"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, X, ShieldCheck, Lock, QrCode, CreditCard, ChevronRight } from "lucide-react";
import { PRICING_TIERS, DEFAULT_PRICING_TIER, formatPhp } from "../utils/pricing";

function formatPesoCompact(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}
import type { PaymentIntentResult, PaymentChannelType, VoterReceipt, PricingTier } from "../types";
import { QrPhPaymentView } from "./QrPhPaymentView";
import { useEventTheme } from "@/features/events/theme";

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

function renderTierBadge(tier: PricingTier): React.JSX.Element | null {
  if (tier.id === "tier_crown_sponsor" || tier.bonusPercentage >= 25) {
    return (
      <span className="border border-sky-300 bg-sky-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-800 uppercase dark:border-sky-700/60 dark:bg-sky-950/40 dark:text-sky-300">
        Best Value
      </span>
    );
  }

  if (tier.isPopular) {
    return (
      <span className="border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-800 uppercase dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300">
        Popular
      </span>
    );
  }

  if (tier.bonusPercentage > 0) {
    return (
      <span className="border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
        +{tier.bonusPercentage}%
      </span>
    );
  }

  return null;
}

interface PaymentIntentPayload {
  eventId: string;
  contestantId: string;
  awardCategoryId?: string | null | undefined;
  voterIdentifier?: string | undefined;
  tierId?: string | undefined;
  customVotes?: number | undefined;
  paymentChannel: PaymentChannelType;
}

async function createPaymentIntent(payload: PaymentIntentPayload): Promise<PaymentIntentResult> {
  const response = await fetch("/api/payments/intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const res = (await response.json()) as {
    success: boolean;
    data?: PaymentIntentResult;
    error?: string;
  };
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.error ?? "Could not initiate payment session.");
}

interface ContestantAvatarProps {
  avatarUrl?: string | null | undefined;
  name: string;
  number: number;
}

function ContestantAvatar({
  avatarUrl,
  name,
  number,
}: Readonly<ContestantAvatarProps>): React.JSX.Element {
  if (avatarUrl) {
    return (
      <div className="relative aspect-4/5 w-14 shrink-0 overflow-hidden border border-slate-200 bg-slate-950 dark:border-slate-700">
        <Image src={avatarUrl} alt={name} fill sizes="56px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="font-heading flex aspect-4/5 w-14 shrink-0 items-center justify-center border border-slate-200 bg-slate-100 text-xs font-black text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      #{number}
    </div>
  );
}

interface PricingTierCardProps {
  tier: PricingTier;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function PricingTierCard({
  tier,
  isSelected,
  onSelect,
}: Readonly<PricingTierCardProps>): React.JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(tier.id)}
      className={`boost-tier-card relative flex flex-col justify-between border p-3 text-left transition-all ${
        isSelected
          ? "selected border-2 border-sky-600 bg-sky-50/40 shadow-xs dark:border-sky-400 dark:bg-sky-950/30"
          : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
      }`}
    >
      {/* Top: Price and subtle tag */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-heading text-xs font-black text-slate-900 dark:text-white">
          {formatPesoCompact(tier.pricePhp)}
        </span>
        {renderTierBadge(tier)}
      </div>

      {/* Bottom: Votes count & bonus */}
      <div className="mt-2.5">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base font-black text-slate-900 dark:text-white">
            {tier.totalVotes}
          </span>
          <span className="font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
            votes
          </span>
        </div>

        <div className="mt-0.5 min-h-[16px]">
          {tier.bonusVotes > 0 ? (
            <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              +{tier.bonusVotes} bonus
            </span>
          ) : (
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              standard
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

interface PaymentChannelSelectorProps {
  paymentChannel: PaymentChannelType;
  onSelectChannel: (channel: PaymentChannelType) => void;
}

function PaymentChannelSelector({
  paymentChannel,
  onSelectChannel,
}: Readonly<PaymentChannelSelectorProps>): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Select Payment Method">
      <span className="font-heading text-[11px] font-extrabold tracking-wider text-slate-600 uppercase dark:text-slate-400">
        Select Payment Method
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          role="radio"
          aria-checked={paymentChannel === "QR_PH"}
          onClick={() => onSelectChannel("QR_PH")}
          className={`flex items-center gap-2.5 border p-2.5 text-left transition-all ${
            paymentChannel === "QR_PH"
              ? "border-sky-600 bg-sky-50/40 dark:border-sky-500 dark:bg-sky-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400">
            <QrCode className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-heading truncate text-xs font-bold text-slate-900 dark:text-white">
              QR Ph / GCash / Maya
            </p>
            <p className="truncate font-sans text-[10px] text-slate-500">
              Scan via GCash, Maya & banking apps
            </p>
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={paymentChannel === "CARD"}
          onClick={() => onSelectChannel("CARD")}
          className={`flex items-center gap-2.5 border p-2.5 text-left transition-all ${
            paymentChannel === "CARD"
              ? "border-sky-600 bg-sky-50/40 dark:border-sky-500 dark:bg-sky-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-heading truncate text-xs font-bold text-slate-900 dark:text-white">
              Credit / Debit Card
            </p>
            <p className="truncate font-sans text-[10px] text-slate-500">Visa, Mastercard, JCB</p>
          </div>
        </button>
      </div>
    </div>
  );
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
}: Readonly<BoostVoteModalProps>): React.JSX.Element | null {
  const { themeSlug } = useEventTheme();
  const [selectedTierId, setSelectedTierId] = useState<string>("tier_popular");
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannelType>("QR_PH");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIntent, setActiveIntent] = useState<PaymentIntentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected details
  const selectedTier = PRICING_TIERS.find((t) => t.id === selectedTierId) ?? DEFAULT_PRICING_TIER;
  const activePricePhp = selectedTier.pricePhp;
  const activeTotalVotes = selectedTier.totalVotes;

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const intent = await createPaymentIntent({
        eventId,
        contestantId,
        awardCategoryId,
        voterIdentifier,
        tierId: selectedTierId,
        paymentChannel,
      });
      setActiveIntent(intent);
    } catch (err) {
      console.error("Checkout intent error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog
      open
      aria-modal="true"
      aria-labelledby="boost-modal-title"
      data-event-theme={themeSlug}
      className="animate-in fade-in fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-none bg-transparent p-3 duration-150 sm:p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="modal-backdrop fixed inset-0 h-full w-full cursor-default border-none bg-slate-950/50 p-0 backdrop-blur-md transition-all dark:bg-black/60"
      />

      <div className="boost-modal-dialog relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d1424]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 fill-amber-500 text-amber-500" aria-hidden="true" />
            <h2
              id="boost-modal-title"
              className="font-heading text-xs font-black tracking-widest text-slate-900 uppercase dark:text-white"
            >
              Power Boost Votes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close boost votes modal"
            className="boost-modal-close-btn flex size-7 items-center justify-center rounded-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
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
              {/* Contestant Clean Header */}
              <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3.5 dark:border-slate-800">
                <ContestantAvatar
                  avatarUrl={contestantAvatarUrl}
                  name={contestantName}
                  number={contestantNumber}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
                    Candidate #{contestantNumber}
                  </span>
                  <h3 className="font-heading truncate text-lg font-extrabold text-slate-900 dark:text-white">
                    {contestantName}
                  </h3>
                  <p className="truncate font-sans text-xs text-slate-600 dark:text-slate-400">
                    {eventTitle}
                  </p>
                </div>
              </div>

              {/* Vote Packages Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-[11px] font-extrabold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                    Select Vote Package
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    ₱10 / base vote
                  </span>
                </div>
                <div
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  role="radiogroup"
                  aria-label="Select Vote Package"
                >
                  {PRICING_TIERS.map((tier) => (
                    <PricingTierCard
                      key={tier.id}
                      tier={tier}
                      isSelected={selectedTierId === tier.id}
                      onSelect={setSelectedTierId}
                    />
                  ))}
                </div>
              </div>

              {/* Payment Channel Selector */}
              <PaymentChannelSelector
                paymentChannel={paymentChannel}
                onSelectChannel={setPaymentChannel}
              />

              {errorMessage && (
                <div className="border border-red-300 bg-red-50 p-3 font-sans text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Order Summary & Submit Action */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                <div>
                  <span className="font-sans text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    Total Amount
                  </span>
                  <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    {formatPhp(activePricePhp)}
                  </p>
                  <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{activeTotalVotes} Votes for #{contestantNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="font-heading flex h-11 items-center gap-2 border border-sky-600 bg-sky-600 px-6 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>
                    {isLoading ? "Processing..." : `Pay ${formatPesoCompact(activePricePhp)} Now`}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-Bit Encrypted · Bangko Sentral ng Pilipinas (BSP) QR Ph Regulated</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
