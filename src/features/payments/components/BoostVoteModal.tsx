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
import {
  PRICING_TIERS,
  DEFAULT_PRICING_TIER,
  calculateCustomVotePackage,
  formatPhp,
} from "../utils/pricing";
import type { PaymentIntentResult, PaymentChannelType, VoterReceipt, PricingTier } from "../types";
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

function renderTierBadge(tier: PricingTier): React.JSX.Element | null {
  if (tier.isPopular) {
    return (
      <span className="border border-amber-300 bg-amber-50 px-1 py-0.5 font-mono text-[9px] font-bold text-amber-800 uppercase dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300">
        Popular
      </span>
    );
  }

  if (tier.bonusPercentage > 0) {
    return (
      <span className="border border-emerald-200 bg-emerald-50 px-1 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
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
      <Image
        src={avatarUrl}
        alt={name}
        width={44}
        height={44}
        className="h-11 w-11 border border-slate-200 object-cover dark:border-slate-700"
      />
    );
  }
  return (
    <div className="font-heading flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-100 text-xs font-black text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
      onClick={() => onSelect(tier.id)}
      className={`relative flex flex-col justify-between border p-3 text-left transition-all ${
        isSelected
          ? "border-2 border-slate-900 bg-slate-50 shadow-xs dark:border-sky-400 dark:bg-sky-950/20"
          : "border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
      }`}
    >
      {/* Top: Price and subtle tag */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-heading text-xs font-black text-slate-900 dark:text-white">
          {formatPhp(tier.pricePhp)}
        </span>
        {renderTierBadge(tier)}
      </div>

      {/* Bottom: Votes count */}
      <div className="mt-2.5 flex items-baseline gap-1">
        <span className="font-mono text-base font-black text-slate-900 dark:text-white">
          {tier.totalVotes}
        </span>
        <span className="font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
          votes
        </span>
      </div>

      {tier.bonusVotes > 0 && (
        <span className="mt-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          +{tier.bonusVotes} bonus
        </span>
      )}
    </button>
  );
}

interface CustomVoteSliderProps {
  customVotes: number;
  onCustomVotesChange: (votes: number) => void;
  customPkg: ReturnType<typeof calculateCustomVotePackage>;
}

function CustomVoteSlider({
  customVotes,
  onCustomVotesChange,
  customPkg,
}: Readonly<CustomVoteSliderProps>): React.JSX.Element {
  return (
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
        onChange={(e) => onCustomVotesChange(Number(e.target.value))}
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
    <div className="flex flex-col gap-2">
      <span className="font-heading text-[11px] font-extrabold tracking-wider text-slate-600 uppercase dark:text-slate-400">
        Select Payment Rail
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelectChannel("QR_PH")}
          className={`flex items-center gap-2.5 border p-2.5 text-left transition-all ${
            paymentChannel === "QR_PH"
              ? "border-sky-600 bg-sky-50/40 dark:border-sky-500 dark:bg-sky-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <QrCode className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="min-w-0">
            <p className="font-heading truncate text-xs font-bold text-slate-900 dark:text-white">
              QR Ph / GCash / Maya
            </p>
            <p className="truncate font-sans text-[10px] text-slate-500">
              Scan via any PH banking app
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectChannel("CARD")}
          className={`flex items-center gap-2.5 border p-2.5 text-left transition-all ${
            paymentChannel === "CARD"
              ? "border-sky-600 bg-sky-50/40 dark:border-sky-500 dark:bg-sky-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <CreditCard className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400" />
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
  const [selectedTierId, setSelectedTierId] = useState<string>("tier_popular");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customVotes, setCustomVotes] = useState<number>(50);
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannelType>("QR_PH");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIntent, setActiveIntent] = useState<PaymentIntentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected details
  const selectedTier = PRICING_TIERS.find((t) => t.id === selectedTierId) ?? DEFAULT_PRICING_TIER;
  const customPkg = calculateCustomVotePackage(customVotes);

  const activePricePhp = isCustomMode ? customPkg.pricePhp : selectedTier.pricePhp;
  const activeTotalVotes = isCustomMode ? customPkg.totalVotes : selectedTier.totalVotes;

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const intent = await createPaymentIntent({
        eventId,
        contestantId,
        awardCategoryId,
        voterIdentifier,
        tierId: isCustomMode ? undefined : selectedTierId,
        customVotes: isCustomMode ? customVotes : undefined,
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
              {/* Contestant Clean Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
                <ContestantAvatar
                  avatarUrl={contestantAvatarUrl}
                  name={contestantName}
                  number={contestantNumber}
                />
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-sky-600 uppercase dark:text-sky-400">
                    Candidate #{contestantNumber}
                  </span>
                  <h3 className="font-heading truncate text-base font-extrabold text-slate-900 dark:text-white">
                    {contestantName}
                  </h3>
                  <p className="truncate font-sans text-xs text-slate-500 dark:text-slate-400">
                    {eventTitle}
                  </p>
                </div>
              </div>

              {/* Minimalist Tab Switcher */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`font-heading -mb-px border-b-2 pb-2 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    !isCustomMode
                      ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Featured Packages
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`font-heading -mb-px ml-6 flex items-center gap-1.5 border-b-2 pb-2 text-xs font-extrabold tracking-wider uppercase transition-all ${
                    isCustomMode
                      ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Sliders className="h-3 w-3" />
                  <span>Custom Vote Slider</span>
                </button>
              </div>

              {/* Tier Cards Grid or Slider */}
              {!isCustomMode ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRICING_TIERS.map((tier) => (
                    <PricingTierCard
                      key={tier.id}
                      tier={tier}
                      isSelected={selectedTierId === tier.id}
                      onSelect={setSelectedTierId}
                    />
                  ))}
                </div>
              ) : (
                <CustomVoteSlider
                  customVotes={customVotes}
                  onCustomVotesChange={setCustomVotes}
                  customPkg={customPkg}
                />
              )}

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
                  className="font-heading flex h-11 items-center gap-2 border border-sky-600 bg-sky-600 px-6 text-xs font-extrabold tracking-widest text-white uppercase shadow-xs transition-all hover:bg-sky-500 active:scale-[0.99] disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isLoading ? "Generating..." : "Proceed to Checkout"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Payment Rails · BSP QR Ph Compliant</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
