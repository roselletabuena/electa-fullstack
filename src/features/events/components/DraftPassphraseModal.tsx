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
      <div className="bg-card/80 border-border/80 shadow-primary/5 w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">Draft Event Preview</h2>
          <p className="text-muted-foreground text-sm">
            This contest is currently unpublished. Enter the guest reviewer passphrase provided by
            the organizer to inspect the preview.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="text-destructive bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-lg border p-3 text-sm"
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
                className="bg-background border-input placeholder:text-muted-foreground focus:ring-primary w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none disabled:opacity-50"
                autoComplete="off"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-primary/20 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
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
