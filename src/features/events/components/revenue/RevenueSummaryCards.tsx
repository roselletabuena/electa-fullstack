import React from "react";
import { TrendingUp, Landmark, Percent, Wallet, ShieldAlert } from "lucide-react";
import type { FinancialMetricsSummary } from "../../types/revenue";

interface RevenueSummaryCardsProps {
  summary: FinancialMetricsSummary;
  isAdmin?: boolean;
}

function formatPhp(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function RevenueSummaryCards({
  summary,
  isAdmin = false,
}: Readonly<RevenueSummaryCardsProps>): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Gross Sales */}
      <div className="rounded-none border border-slate-300 bg-white p-5 shadow-xs transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Gross Sales
          </span>
          <div className="border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatPhp(summary.grossSalesPhp)}
          </p>
          <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
            Across {summary.totalTransactionsCount.toLocaleString()} confirmed boost transactions
          </p>
        </div>
      </div>

      {/* Gateway Fees */}
      <div className="rounded-none border border-slate-300 bg-white p-5 shadow-xs transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Gateway Fees
          </span>
          <div className="border border-amber-200 bg-amber-50 p-2 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
            <Landmark className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-mono text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            -{formatPhp(summary.gatewayFeesPhp)}
          </p>
          <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
            PayMongo processing deductions
          </p>
        </div>
      </div>

      {/* Platform Take-Rate */}
      <div className="rounded-none border border-slate-300 bg-white p-5 shadow-xs transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Platform Fee
            </span>
            <span className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {isAdmin ? "Configurable" : "Read-Only"}
            </span>
          </div>
          <div className="border border-sky-200 bg-sky-50 p-2 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400">
            <Percent className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            -{formatPhp(summary.platformCommissionPhp)}
          </p>
          <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
            Rate: {summary.platformTakeRatePercentage.toFixed(1)}% commission
          </p>
        </div>
      </div>

      {/* Net Organizer Revenue */}
      <div className="rounded-none border border-slate-300 bg-white p-5 shadow-xs transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Net Revenue
          </span>
          <div className="border border-blue-200 bg-blue-50 p-2 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-mono text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            {formatPhp(summary.netOrganizerRevenuePhp)}
          </p>
          <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
            Gross minus gateway & platform fees
          </p>
        </div>
      </div>

      {/* Available Payout Balance */}
      <div className="rounded-none border-2 border-slate-900 bg-slate-900 p-5 text-white shadow-sm dark:border-sky-500 dark:bg-[#0f172a]">
        <div className="flex items-center justify-between">
          <span className="font-heading text-xs font-bold tracking-wider text-slate-300 uppercase dark:text-sky-300">
            Available Balance
          </span>
          <div className="border border-slate-700 bg-slate-800 p-2 text-sky-400 dark:border-sky-800 dark:bg-sky-950">
            <Wallet className="size-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="font-mono text-2xl font-extrabold tracking-tight text-white dark:text-sky-100">
            {formatPhp(summary.availablePayoutBalancePhp)}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400">
            {summary.totalPendingPayoutPhp > 0 && (
              <span className="inline-flex items-center gap-0.5 text-amber-300">
                <ShieldAlert className="size-3" />
                {formatPhp(summary.totalPendingPayoutPhp)} locked
              </span>
            )}
            {summary.totalPendingPayoutPhp === 0 && <span>Ready for immediate disbursement</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
