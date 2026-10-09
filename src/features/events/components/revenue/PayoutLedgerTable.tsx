import React from "react";
import { Landmark, CheckCircle, Clock, XCircle, ArrowUpRight } from "lucide-react";
import type { PayoutLedgerItem } from "../../types/revenue";

interface PayoutLedgerTableProps {
  payouts: PayoutLedgerItem[];
}

function formatPhp(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle className="size-3" /> COMPLETED
        </span>
      );
    case "PROCESSING":
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <Clock className="size-3" /> {status}
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <XCircle className="size-3" /> REJECTED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 border border-slate-300 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {status}
        </span>
      );
  }
}

export function PayoutLedgerTable({
  payouts,
}: Readonly<PayoutLedgerTableProps>): React.JSX.Element {
  return (
    <div className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Landmark className="size-4 text-sky-600 dark:text-sky-400" />
          <h2 className="font-heading text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
            Disbursement & Payout Ledger
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="font-heading border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Reference
              </th>
              <th scope="col" className="px-5 py-3.5">
                Method & Account
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Amount
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status
              </th>
              <th scope="col" className="px-5 py-3.5">
                Requested At
              </th>
              <th scope="col" className="px-5 py-3.5">
                Disbursement Ref
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800/60">
            {payouts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No payout requests recorded yet.
                </td>
              </tr>
            ) : (
              payouts.map((po) => (
                <tr
                  key={po.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/30"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {po.referenceNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-heading font-semibold text-slate-800 dark:text-slate-200">
                        {po.payoutMethod.replace("_", " ")}
                      </span>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {po.accountName} ({po.accountNumberMasked})
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatPhp(po.amountInPhp)}
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(po.status)}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(po.requestedAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {po.adminReferenceNumber ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <ArrowUpRight className="size-3" />
                        {po.adminReferenceNumber}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
