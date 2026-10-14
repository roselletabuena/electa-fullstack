"use client";

import React, { useState } from "react";
import type { TurnoutMetricsDto, OfficeTallyDto } from "../types/turnout-audit";
import { exportCertifiedTally } from "../actions/export-certified-tally";

export interface ElectionAuditPanelProps {
  eventId: string;
  eventTitle: string;
  endsAt: string;
  turnout: TurnoutMetricsDto;
  offices: OfficeTallyDto[];
  className?: string;
}

export function ElectionAuditPanel({
  eventId,
  eventTitle,
  endsAt,
  turnout,
  offices,
  className = "",
}: ElectionAuditPanelProps): React.JSX.Element {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [auditHash, setAuditHash] = useState<string | null>(null);
  const [certifiedAt, setCertifiedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedEndsAt = new Date(endsAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleExport = async (): Promise<void> => {
    try {
      setIsExporting(true);
      setErrorMessage(null);

      const res = await exportCertifiedTally({ eventId, format });

      if (!res.success || !res.data) {
        setErrorMessage(res.error?.message ?? "Failed to export certified tally.");
        return;
      }

      setAuditHash(res.data.auditHash);
      setCertifiedAt(res.data.certifiedAt);

      // Trigger browser download
      const mimeType = format === "csv" ? "text/csv;charset=utf-8;" : "application/json";
      const blob = new Blob([res.data.content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unexpected export error.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyHash = (): void => {
    if (!auditHash) return;
    navigator.clipboard.writeText(auditHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-label="Certified Election Audit Section"
      className={`border border-slate-300 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0d1424] rounded-none ${className}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700 dark:text-sky-400">
            Ballot Tally & Official Audit
          </span>
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            Official Results Certification: {eventTitle}
          </h2>
        </div>

        <div>
          <span
            data-testid="audit-status-badge"
            className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-none border ${
              turnout.isPollClosed
                ? "bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-600"
                : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            }`}
          >
            {turnout.isPollClosed ? "Certified Audit Ready" : "Ballots Sealed"}
          </span>
        </div>
      </div>

      {/* Case 1: Polls Still Open - Results Sealed Banner */}
      {!turnout.isPollClosed ? (
        <div
          data-testid="sealed-results-banner"
          className="mt-6 border border-amber-300 bg-amber-50 p-6 text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-200 rounded-none space-y-3"
        >
          <div className="flex items-center gap-3">
            <span
              role="img"
              aria-label="Padlock"
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-amber-400 bg-amber-200/60 text-lg font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200 rounded-none"
            >
              🔒
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                Candidate Results Strictly Sealed
              </h3>
              <p className="text-xs text-amber-900/90 dark:text-amber-300/90">
                Results sealed until polls close on {formattedEndsAt}.
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
            Per institutional election bylaws, candidate standings, vote tallies, and rank positions
            are cryptographically sealed during active voting. Only aggregate participation counts
            are visible above until the polling window has elapsed.
          </p>
        </div>
      ) : (
        /* Case 2: Polls Closed - Official Audit View */
        <div className="mt-6 space-y-8" data-testid="unsealed-audit-view">
          {offices.length === 0 ? (
            <div className="border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 rounded-none">
              No positions or candidates registered for this election.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {offices.map((office) => (
                <div
                  key={office.officeId}
                  data-testid={`office-card-${office.officeId}`}
                  className="border border-slate-300 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40 rounded-none space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-heading">
                      {office.officeName}
                    </h3>
                    <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-400">
                      {office.totalVotesCast.toLocaleString()} votes cast
                    </span>
                  </div>

                  <div className="space-y-3">
                    {office.candidates.map((candidate) => (
                      <div
                        key={candidate.candidateId}
                        className={`p-3 border rounded-none transition-colors ${
                          candidate.isWinner
                            ? "bg-white border-emerald-500 shadow-xs dark:bg-[#0f172a] dark:border-emerald-600"
                            : "bg-white/80 border-slate-200 dark:bg-[#0a0f1d] dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-slate-300 bg-slate-100 text-[10px] font-bold font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-none">
                              #{candidate.contestantNumber}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {candidate.candidateName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {candidate.isWinner && (
                              <span
                                data-testid="winner-badge"
                                className="bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-none shadow-xs"
                              >
                                Elected
                              </span>
                            )}
                            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                              {candidate.voteCount.toLocaleString()}
                            </span>
                            <span className="text-xs font-normal text-slate-500 font-mono">
                              ({candidate.votePercentage}%)
                            </span>
                          </div>
                        </div>

                        {/* Relative Share Bar */}
                        <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                          <div
                            className={`h-full rounded-none ${
                              candidate.isWinner
                                ? "bg-emerald-600 dark:bg-emerald-500"
                                : "bg-sky-600 dark:bg-sky-500"
                            }`}
                            style={{ width: `${Math.min(100, candidate.votePercentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action & Certification Box */}
          <div className="border border-slate-300 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60 rounded-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Audit Export & Certification
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Generate a tamper-evident audit report with certified winners and cryptographic SHA-256 hash.
                </p>
              </div>

              {/* Format selection pills & Download CTA */}
              <div className="flex items-center gap-3">
                <div
                  role="radiogroup"
                  aria-label="Export file format"
                  className="flex border border-slate-300 dark:border-slate-700 rounded-none overflow-hidden"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={format === "csv"}
                    onClick={() => setFormat("csv")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-none transition-colors ${
                      format === "csv"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={format === "json"}
                    onClick={() => setFormat("json")}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-none transition-colors border-l border-slate-300 dark:border-slate-700 ${
                      format === "json"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="export-tally-button"
                  disabled={isExporting}
                  onClick={handleExport}
                  className="bg-slate-900 text-white font-extrabold uppercase tracking-widest text-xs px-4 py-2 border border-slate-900 rounded-none shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 dark:hover:bg-slate-200 cursor-pointer"
                >
                  {isExporting ? "Certifying..." : "Certify & Export Official Results"}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                data-testid="export-error-notice"
                className="border border-red-300 bg-red-50 p-3 text-xs text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 rounded-none"
              >
                <strong>Error:</strong> {errorMessage}
              </div>
            )}

            {/* Generated Hash Display */}
            {auditHash && (
              <div
                data-testid="certified-hash-container"
                className="border border-emerald-300 bg-emerald-50/70 p-4 dark:border-emerald-800/80 dark:bg-emerald-950/30 rounded-none space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    Tamper-Evident SHA-256 Audit Digest
                  </span>
                  {certifiedAt && (
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
                      Certified: {new Date(certifiedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <code
                    data-testid="audit-hash-code"
                    className="flex-1 overflow-x-auto border border-emerald-300 bg-white p-2 font-mono text-xs text-slate-900 dark:border-emerald-800 dark:bg-[#07131e] dark:text-emerald-100 rounded-none select-all"
                  >
                    {auditHash}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 rounded-none cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
