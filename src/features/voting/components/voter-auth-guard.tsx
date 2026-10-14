"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn, CheckCircle2, ArrowRight } from "lucide-react";

export interface VoterAuthGuardProps {
  type: "unauthenticated" | "ineligible" | "already_voted";
  eventSlug: string;
  eventTitle?: string;
  userEmail?: string;
  allowedDomains?: string[];
  reason?: string;
}

export function VoterAuthGuard({
  type,
  eventSlug,
  eventTitle,
  userEmail,
  allowedDomains = [],
  reason,
}: Readonly<VoterAuthGuardProps>): React.JSX.Element {
  const router = useRouter();

  const handleSignIn = () => {
    const returnPath = `/events/${eventSlug}/ballot`;
    router.push(
      `/api/auth/cognito/initiate?provider=Google&returnTo=${encodeURIComponent(returnPath)}`,
    );
  };

  if (type === "already_voted") {
    return (
      <div className="card-style w-full border border-slate-300 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex size-14 items-center justify-center border border-sky-500/30 bg-sky-50 text-sky-600 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-400">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Official Ballot Already Cast
          </h2>
          <p className="mt-2 font-sans text-sm text-slate-600 dark:text-slate-300">
            You have already recorded your vote for{" "}
            <span className="font-bold text-slate-900 dark:text-white">{eventTitle ?? "this election"}</span>.
            Under institutional election guidelines, each eligible student voter is permitted exactly one official ballot.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/events/${eventSlug}`}
              className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-5 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <span>Return to Election Hub</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={`/events/${eventSlug}/leaderboard`}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest text-slate-800 uppercase shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (type === "ineligible") {
    return (
      <div className="card-style w-full border border-amber-300 bg-white p-6 sm:p-8 dark:border-amber-900/60 dark:bg-[#0d1424]">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex size-14 items-center justify-center border border-amber-500/30 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-400">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="mt-4 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Voter Eligibility Restricted
          </h2>
          <p className="mt-2 font-sans text-sm text-slate-600 dark:text-slate-300">
            {reason ?? "Your authenticated account does not match the voter eligibility requirements for this election."}
          </p>

          {userEmail && (
            <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Signed in as: <span className="font-bold">{userEmail}</span>
            </div>
          )}

          {allowedDomains.length > 0 && (
            <div className="mt-4">
              <span className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Authorized Institutional Domains:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {allowedDomains.map((domain) => (
                  <span
                    key={domain}
                    className="border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    @{domain.replace(/^@/, "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest text-slate-800 uppercase shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>Switch Account</span>
            </button>
            <Link
              href={`/events/${eventSlug}`}
              className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-5 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // type === "unauthenticated"
  return (
    <div className="card-style w-full border border-slate-300 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-[#0d1424]">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex size-14 items-center justify-center border border-sky-500/20 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-950/50 dark:text-sky-400">
          <LogIn className="size-8" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Sign In to Access Ballot
        </h2>
        <p className="mt-2 font-sans text-sm text-slate-600 dark:text-slate-300">
          This is an official institutional ballot. Please sign in with your institutional or Google account to verify your eligibility and cast your votes.
        </p>

        {allowedDomains.length > 0 && (
          <div className="mt-4">
            <span className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Eligible Email Domains:
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {allowedDomains.map((domain) => (
                <span
                  key={domain}
                  className="border border-slate-300 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  @{domain.replace(/^@/, "")}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSignIn}
            className="btn-primary inline-flex items-center justify-center gap-2 border border-slate-900 bg-slate-900 px-6 py-3 text-xs font-extrabold tracking-widest text-white uppercase shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <LogIn className="size-4" />
            <span>Sign In with Institutional Account</span>
          </button>
          <Link
            href={`/events/${eventSlug}`}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest text-slate-800 uppercase shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span>Return to Event</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
