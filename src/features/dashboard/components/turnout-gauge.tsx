import React from "react";
import type { TurnoutMetricsDto } from "../types/turnout-audit";

export interface TurnoutGaugeProps {
  metrics: TurnoutMetricsDto;
  className?: string;
}

export function TurnoutGauge({ metrics, className = "" }: TurnoutGaugeProps): React.JSX.Element {
  const {
    totalWhitelistedVoters,
    recordedParticipations,
    turnoutPercentage,
    isQuorumMet,
    quorumThresholdPercentage,
    votingVelocityPerHour,
    isPollClosed,
  } = metrics;

  return (
    <section
      aria-label="Election Voter Turnout Gauge"
      className={`border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424] rounded-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 dark:text-sky-400">
            Real-Time Participation Telemetry
          </span>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            Voter Turnout & Quorum Status
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Poll Status Pill */}
          <span
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-none border ${
              isPollClosed
                ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                : "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            }`}
          >
            {isPollClosed ? "Polls Closed" : "Live Polls Open"}
          </span>

          {/* Quorum Badge */}
          <span
            data-testid="quorum-badge"
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-none border ${
              isQuorumMet
                ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600"
                : "bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-600"
            }`}
          >
            {isQuorumMet
              ? `Quorum Reached (${turnoutPercentage}%)`
              : `Quorum Pending (${quorumThresholdPercentage}% Req.)`}
          </span>
        </div>
      </div>

      {/* Main Gauge Display */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-6">
        {/* Big percentage display */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              data-testid="turnout-percentage-value"
              className="text-5xl font-black font-mono tracking-tighter text-slate-900 dark:text-slate-50"
            >
              {turnoutPercentage.toFixed(1)}
            </span>
            <span className="text-2xl font-black text-slate-600 dark:text-slate-400 font-mono">%</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mt-1">
            Official Electorate Turnout
          </span>
        </div>

        {/* Progress Bar with Quorum marker */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
            <span>0%</span>
            <span className="text-amber-800 dark:text-amber-400 font-semibold">
              Quorum Threshold: {quorumThresholdPercentage}%
            </span>
            <span>100%</span>
          </div>

          {/* Accessible Custom Progress Bar */}
          <div
            role="progressbar"
            aria-valuenow={turnoutPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Voter Turnout Percentage"
            className="relative h-6 w-full bg-slate-100 border border-slate-300 dark:bg-slate-900 dark:border-slate-700 overflow-hidden rounded-none"
          >
            {/* Filled Bar */}
            <div
              className={`h-full transition-all duration-500 rounded-none ${
                isQuorumMet
                  ? "bg-linear-to-r from-emerald-600 to-sky-600 dark:from-emerald-500 dark:to-sky-500"
                  : "bg-linear-to-r from-sky-600 to-amber-600 dark:from-sky-500 dark:to-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, turnoutPercentage))}%` }}
            />

            {/* Quorum Marker Line */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10"
              style={{ left: `${quorumThresholdPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roster Empty Warning */}
      {totalWhitelistedVoters === 0 && (
        <div
          data-testid="empty-roster-notice"
          className="mt-6 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-200 rounded-none"
        >
          <strong>Notice:</strong> No whitelisted voters found in the student roster for this election. Upload a roster CSV to establish the voter denominator.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-4 dark:border-slate-800">
        <div className="border-l-2 border-slate-300 pl-3 dark:border-slate-700">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Whitelisted Voters
          </span>
          <span
            data-testid="roster-count"
            className="mt-0.5 block text-lg font-bold font-mono text-slate-900 dark:text-slate-100"
          >
            {totalWhitelistedVoters.toLocaleString()}
          </span>
        </div>

        <div className="border-l-2 border-sky-500 pl-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Recorded Ballots
          </span>
          <span
            data-testid="participations-count"
            className="mt-0.5 block text-lg font-bold font-mono text-slate-900 dark:text-slate-100"
          >
            {recordedParticipations.toLocaleString()}
          </span>
        </div>

        <div className="border-l-2 border-amber-500 pl-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Quorum Required
          </span>
          <span className="mt-0.5 block text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
            {Math.ceil((totalWhitelistedVoters * quorumThresholdPercentage) / 100).toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">({quorumThresholdPercentage}%)</span>
          </span>
        </div>

        <div className="border-l-2 border-purple-500 pl-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Voting Velocity
          </span>
          <span
            data-testid="voting-velocity"
            className="mt-0.5 block text-lg font-bold font-mono text-slate-900 dark:text-slate-100"
          >
            {votingVelocityPerHour.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">voters/hr</span>
          </span>
        </div>
      </div>
    </section>
  );
}
