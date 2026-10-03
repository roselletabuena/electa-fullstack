import React from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import type { ContestantRevenueShare } from "../../types/revenue";

interface ContestantRevenueShareTableProps {
  shares: ContestantRevenueShare[];
}

function formatPhp(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ContestantRevenueShareTable({
  shares,
}: ContestantRevenueShareTableProps): React.JSX.Element {
  return (
    <div className="rounded-none border border-slate-300 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0d1424]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-sky-600 dark:text-sky-400" />
          <h2 className="font-heading text-sm font-bold tracking-wider text-slate-900 uppercase dark:text-slate-100">
            Contestant Revenue Attribution
          </h2>
        </div>
        <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
          {shares.length} Contestants Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="font-heading border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Contestant
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Total Paid Votes
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Gross Boost Revenue
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Share of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans dark:divide-slate-800/60">
            {shares.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No paid votes recorded yet for this event.
                </td>
              </tr>
            ) : (
              shares.map((c) => (
                <tr
                  key={c.contestantId}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/30"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-8 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {c.avatarUrl ? (
                          <Image
                            src={c.avatarUrl}
                            alt={c.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="font-heading flex size-full items-center justify-center text-xs font-bold text-slate-400">
                            #{c.contestantNumber}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-slate-900 dark:text-slate-100">
                          #{c.contestantNumber} {c.name}
                        </p>
                        {c.divisionName && (
                          <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400">
                            {c.divisionName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                    {c.totalVotes.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatPhp(c.grossSalesPhp)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full bg-sky-500"
                          style={{ width: `${Math.min(100, c.revenueSharePercentage)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {c.revenueSharePercentage.toFixed(1)}%
                      </span>
                    </div>
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
