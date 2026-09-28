"use client";

import React from "react";
import Link from "next/link";
import { Lock, Sparkles, X, Heart, ShieldCheck } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  candidateName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8 dark:border-indigo-900/60 dark:bg-slate-900/95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Glow Header Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-950/80 dark:text-indigo-400">
          <Heart className="size-7 fill-indigo-600 dark:fill-indigo-400" />
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles className="size-3.5" />
            <span>Free Daily Voting</span>
          </div>

          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign In to Cast Your Vote
          </h3>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {candidateName ? (
              <>
                Support{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {candidateName}
                </span>{" "}
                with your allocated daily free votes by signing in to your verified account.
              </>
            ) : (
              "Cast your allocated free daily votes by signing in to your verified account."
            )}
          </p>
        </div>

        {/* Value Props */}
        <div className="my-6 space-y-2 rounded-2xl bg-slate-50/80 p-4 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>1 to 5 Free daily votes restored every 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>Verified accounts protect fair contest rankings</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-98"
          >
            Sign In with Email or Social
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
