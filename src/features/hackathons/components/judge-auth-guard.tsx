import React from "react";
import Link from "next/link";
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react";

export interface JudgeAuthGuardProps {
  readonly type: "unauthenticated" | "forbidden";
  readonly eventSlug: string;
  readonly eventTitle?: string | undefined;
  readonly userEmail?: string | undefined;
}

export function JudgeAuthGuard({
  type,
  eventSlug,
  eventTitle,
  userEmail,
}: Readonly<JudgeAuthGuardProps>): React.JSX.Element {
  const isUnauthenticated = type === "unauthenticated";

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-none border border-slate-300 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-none border border-amber-500/30 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-400">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h2 className="mt-4 font-heading text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            {isUnauthenticated
              ? "Judge Sign-In Required"
              : "Judge Portal Access Restricted"}
          </h2>

          <p className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            {isUnauthenticated ? (
              <>
                You must sign in with verified judge credentials to access the
                rubric scoring console for{" "}
                <strong className="font-semibold text-slate-900 dark:text-slate-200">
                  {eventTitle ?? "this hackathon"}
                </strong>
                .
              </>
            ) : (
              <>
                Your current account{" "}
                {userEmail && (
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ({userEmail})
                  </span>
                )}{" "}
                does not have assigned judge or organizer privileges for{" "}
                <strong className="font-semibold text-slate-900 dark:text-slate-200">
                  {eventTitle ?? "this hackathon"}
                </strong>
                .
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
            {isUnauthenticated ? (
              <Link
                href={`/login?returnTo=/events/${encodeURIComponent(eventSlug)}/judging`}
                className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-900 bg-slate-900 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-white shadow-sm hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In as Judge</span>
              </Link>
            ) : null}

            <Link
              href={`/events/${eventSlug}`}
              className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-300 bg-white px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Event</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
