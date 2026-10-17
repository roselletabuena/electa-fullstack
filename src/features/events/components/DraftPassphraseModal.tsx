"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export interface DraftPassphraseModalProps {
  slug: string;
  onUnlocked?: () => void;
}

export function DraftPassphraseModal({
  slug,
  onUnlocked,
}: Readonly<DraftPassphraseModalProps>): React.JSX.Element {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setError("Please enter the preview passphrase.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${encodeURIComponent(slug)}/preview-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Invalid passphrase. Please check and try again.");
        setLoading(false);
        return;
      }

      if (onUnlocked) {
        onUnlocked();
      } else {
        router.refresh();
      }
    } catch {
      setError("Failed to connect to the authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-none border border-slate-300 bg-white p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-slate-800 dark:bg-[#0d1424]">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="heading-font text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Draft Event Preview
          </h2>
          <p className="text-muted-foreground text-sm">
            This contest is currently unpublished. Enter the guest reviewer passphrase provided by
            the organizer to inspect the preview.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-none border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="draft-passphrase"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Preview Passphrase
            </label>
            <div className="relative">
              <KeyRound className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                id="draft-passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase..."
                disabled={loading}
                className="w-full rounded-none border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-100 dark:focus:ring-slate-100"
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full cursor-pointer items-center justify-center gap-2 py-2.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Unlock Preview</span>
            )}
          </button>
        </form>

        <div className="border-border/40 border-t pt-4 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
