import React from "react";
import { CreditCard, QrCode, Smartphone } from "lucide-react";
import type { PaymentChannelBreakdown } from "../../types/revenue";

interface PaymentChannelBreakdownCardProps {
  breakdown: PaymentChannelBreakdown[];
}

function formatPhp(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "QR_PH":
      return <QrCode className="size-4 text-emerald-600 dark:text-emerald-400" />;
    case "CARD":
      return <CreditCard className="size-4 text-blue-600 dark:text-blue-400" />;
    default:
      return <Smartphone className="size-4 text-sky-600 dark:text-sky-400" />;
  }
}

export function PaymentChannelBreakdownCard({
  breakdown,
}: Readonly<PaymentChannelBreakdownCardProps>): React.JSX.Element {
  return (
    <div className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-sky-600 dark:text-sky-400" />
          <h2 className="font-heading text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
            Payment Method Mix
          </h2>
        </div>
        <span className="font-sans text-xs text-slate-500 dark:text-slate-400">Fee Deductions</span>
      </div>

      <div className="space-y-4 p-5">
        {breakdown.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No transaction records found.
          </p>
        ) : (
          breakdown.map((item) => (
            <div key={item.channel} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                    {getChannelIcon(item.channel)}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-slate-900 dark:text-slate-100">
                      {item.displayName}
                    </span>
                    <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      ({item.transactionCount.toLocaleString()} txs)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatPhp(item.grossSalesPhp)}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                    fee: -{formatPhp(item.gatewayFeePhp)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-slate-800 dark:bg-sky-500"
                  style={{ width: `${Math.min(100, item.percentageOfSales)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
